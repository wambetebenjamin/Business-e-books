#!/usr/bin/env python3
"""Content completeness cross-check: every phrase from the user's pasted content
must appear in the built PPTX. Run: python3 check-content.py"""
import zipfile, re, html, sys

PPTX = 'output/Gestalt Theory and Its Application to Counselling.pptx'

def norm(s):
    s = (s.replace('\u2019', "'").replace('\u2018', "'")
          .replace('\u201c', '"').replace('\u201d', '"')
          .replace('\u2013', '-').replace('\u2014', '-')
          .replace('\u2026', '...'))
    s = re.sub(r'["\']', '', s)          # strip all quotes/apostrophes
    return re.sub(r'\s+', ' ', s).lower().strip()

z = zipfile.ZipFile(PPTX)
slides = {}
for i in range(1, 23):
    xml = z.read(f'ppt/slides/slide{i}.xml').decode('utf8')
    txt = ' '.join(html.unescape(t) for t in re.findall(r'<a:t>([\s\S]*?)</a:t>', xml))
    slides[i] = norm(txt)

R = {
1: ["gestalt theory","and its application to counselling","presented by","group 4","josephine biwott","macp/35996/0/26","cynthia cherono","macp/35785/4/26","yvonne juliet awuor","mald/36547/4/26","course","mcp504","theories of counseling and psychotherapy","institution","pan african christian university","lecturer","dr. lucy gachenia"],
2: ["experiential and humanistic approach to counselling","emphasizes","awareness, present experience and contact","understands individuals within their","environment and relationships","encourages personal responsibility, choice and authentic living","focuses on the clients experience in the","here-and-now","(perls et al., 1951; joyce & sills, 2014)"],
3: ["emerged during the","1940s and 1950s","developed partly in response to limitations perceived in","traditional psychoanalysis","influenced by","gestalt psychology","phenomenology","existential philosophy","field theory","holistic approaches","emphasized","experience, awareness and contact","intellectual roots","gestalt therapy","(perls et al., 1951; woldt & toman, 2005)"],
4: ["major theorists","fritz perls","1893-1970","major founder","awareness, experience and responsibility","laura perls","1905-1990","major contributor","contact, relationship and embodied experience","paul goodman","1911-1972","co-author of gestalt therapy (1951)","major contributor to theoretical formulation","(perls et al., 1951; woldt & toman, 2005)"],
5: ["core assumptions of gestalt therapy","people are best understood as whole persons","human experience is influenced by the environment","awareness is central to psychological growth","experience unfolds in the present","people have capacity for choice and self-regulation","healthy functioning involves meaningful contact","psychological difficulties may involve interruptions in awareness or contact","(perls et al., 1951; brownell, 2010; joyce & sills, 2014)"],
6: ["awareness","central concept in gestalt therapy","noticing","thoughts","feelings","bodily sensations","behaviour","needs","focuses on present experience","creates opportunities for choice and change","the process","choice","change","(perls et al., 1951; joyce & sills, 2014)"],
7: ["the here-and-now","focuses on the clients","present experience","past experiences are explored through their","current impact","includes thoughts, emotions, bodily sensations and behaviour","encourages","direct experience","rather than excessive intellectual analysis","the therapeutic relationship provides an opportunity for","present-moment awareness","(perls et al., 1951; brownell, 2010)"],
8: ["figure and ground","figure","what is most prominent in awareness","ground","the surrounding context and experiences","needs and concerns move between figure and ground","the figure changes as circumstances change","awareness helps identify what is most significant in the present","(perls et al., 1951; woldt & toman, 2005)"],
9: ["contact and contact boundary","contact:","interaction between the individual and environment","contact boundary:","point at which the individual and environment meet","healthy contact allows needs to be addressed while maintaining a sense of self","engaging, responding and withdrawing","relationships, culture and circumstances influence contact","individual","contact boundary","environment","(perls et al., 1951; joyce & sills, 2014)"],
10: ["unfinished business","unresolved experiences or emotions","may include","grief","anger","guilt","resentment","unmet needs","can remain psychologically active in the present","may interfere with healthy contact","therapy promotes","awareness and processing","(perls et al., 1951; joyce & sills, 2014)"],
11: ["personal responsibility","recognizing ones own choices and responses","agency and ownership","encourages authentic decision-making","uses language that reflects personal experience","responsibility","blame","language in practice","you make me angry.","i notice that i become angry when…","(perls et al., 1951; corey, 2024)"],
12: ["role of the gestalt counsellor","the counsellor","facilitates awareness","focuses on present experience","observes verbal and non-verbal behaviour","uses the therapeutic relationship","encourages authentic expression","explores interruptions in contact","promotes responsibility and choice","(joyce & sills, 2014; brownell, 2010)"],
13: ["gestalt therapeutic techniques","empty-chair technique","two-chair dialogue","exaggeration","staying with the feeling","role-play","body awareness","i statements","dream work","here-and-now questioning","(joyce & sills, 2014)"],
14: ["empty-chair technique","client imagines another person in an empty chair","speaks directly to the imagined person","brings unresolved experiences into","present awareness","facilitates expression of unfinished emotions","may promote new awareness and perspectives","example","imagine your father is sitting in that chair. what would you want him to hear from you?","the setup","client","imagined person","(joyce & sills, 2014)"],
15: ["other experiential techniques","technique","purpose","two-chair dialogue","explore opposing parts","exaggeration","increase awareness","staying with the feeling","explore emerging emotions","body awareness","notice physical experience","i statements","own personal experience","dream work","explore present meaning","(joyce & sills, 2014)"],
16: ["application in counselling","gestalt therapy can be applied to","grief and loss","relationship difficulties","anxiety and emotional distress","unresolved anger","identity concerns","emotional-expression difficulties","personal growth","unresolved interpersonal experiences","therapeutic movement","awareness","contact","responsibility","choice","growth","(brownell, 2010; joyce & sills, 2014)"],
17: ["strengths of gestalt therapy","promotes self-awareness","focuses on lived experience","encourages agency and responsibility","integrates","mind, emotion and body","considers person-environment interaction","encourages active client participation","supports experiential emotional processing"],
18: ["limitations and criticisms","some techniques may feel intense","requires skilled and sensitive application","may be challenging for clients who prefer highly structured approaches","experiential techniques can be","misused","not every intervention suits every client","cultural context","must be considered","ethical boundaries are essential","(corey, 2024; joyce & sills, 2014)"],
19: ["case application","client","20-year-old undergraduate scholarship student","presenting concerns","academic anxiety","fear of losing scholarship","fear of disappointing family","difficulty expressing emotions","pressure to maintain high grades","gestalt conceptualization","anxiety becomes figure","possible introjected expectations","limited awareness of personal needs","interrupted contact","possible interventions","here-and-now exploration","body awareness","staying with the feeling","i statements","exploring introjected beliefs"],
20: ["critical evaluation","contributions","holistic understanding of human experience","strong emphasis on awareness","integrates body, emotion and cognition","recognizes person-environment interaction","promotes agency and authentic choice","considerations","cultural adaptation","client readiness","therapist competence","appropriate use of experiential techniques","balance between present and past experience"],
21: ["conclusion","awareness","here-and-now","contact","responsibility & choice","growth","greater awareness creates greater possibilities for choice and change.","(perls et al., 1951; joyce & sills, 2014)"],
22: ["references","brownell, p. (2010).","gestalt therapy: a guide to contemporary practice","springer publishing company","corey, g. (2024).","theory and practice of counseling and psychotherapy","(11th ed.). cengage learning","joyce, p., & sills, c. (2014).","skills in gestalt counselling & psychotherapy","(3rd ed.). sage","perls, f. s., hefferline, r. f., & goodman, p. (1951).","excitement and growth in the human personality","julian press","woldt, a. l., & toman, s. m. (eds.). (2005).","gestalt therapy: history, theory, and practice","yontef, g., & fuhr, r. (2005). gestalt therapy theory of change. in a. l. woldt & s. toman (eds.),","(pp. 81-100). sage"],
}

missing, total = [], 0
for sn, phrases in R.items():
    st = slides[sn]
    for p in phrases:
        total += 1
        if norm(p) not in st:
            missing.append(f"S{sn}: {p!r}")
print(f"checked {total} required phrases across {len(R)} slides")
if missing:
    print("MISSING:")
    for m in missing: print("  ✗", m)
    sys.exit(1)
print("✓ every required phrase present — content complete")
