import re, json, sys, zipfile
from xml.etree import ElementTree as ET
NS={'a':'http://schemas.openxmlformats.org/drawingml/2006/main',
    'p':'http://schemas.openxmlformats.org/presentationml/2006/main',
    'r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
SRC="/tmp/pptx/ex"
out={}
for i in range(1,23):
    tree=ET.parse(f"{SRC}/ppt/slides/slide{i}.xml")
    root=tree.getroot()
    spTree=root.find('.//p:cSld/p:spTree',NS)
    shapes=[]
    def walk(el, depth=0):
        for child in el:
            tag=child.tag.split('}')[1]
            if tag=='sp':
                nv=child.find('.//p:cNvPr',NS); name=nv.get('name')
                xfrm=child.find('.//a:xfrm',NS)
                geom=child.find('./p:spPr/a:prstGeom',NS)
                paras=[]
                for p in child.findall('.//a:p',NS):
                    txt=''.join(t.text or '' for t in p.findall('.//a:t',NS))
                    sz=None;b=None;font=None;algn=None
                    rPr=p.find('.//a:rPr',NS)
                    if rPr is not None:
                        sz=rPr.get('sz');b=rPr.get('b')
                        lat=rPr.find('a:latin',NS)
                        if lat is not None: font=lat.get('typeface')
                    pPr=p.find('a:pPr',NS)
                    if pPr is not None: algn=pPr.get('algn')
                    if txt.strip()=='' and not paras: continue
                    paras.append(dict(text=txt,sz=sz,b=b,font=font,algn=algn))
                fill=child.find('./p:spPr/a:solidFill/a:srgbClr',NS)
                shapes.append(dict(kind='sp',name=name,depth=depth,paras=paras,
                    geom=(geom.get('prst') if geom is not None else None),
                    fill=(fill.get('val') if fill is not None else None)))
            elif tag=='pic':
                nv=child.find('.//p:cNvPr',NS)
                shapes.append(dict(kind='pic',name=nv.get('name'),depth=depth,descr=nv.get('descr')))
            elif tag=='grpSp':
                walk(child, depth+1)
    walk(spTree)
    out[i]=shapes
json.dump(out, open('content_raw.json','w'), indent=1, ensure_ascii=False)
print("ok")
