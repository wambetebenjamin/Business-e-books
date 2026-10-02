const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const out = path.join(__dirname, 'Lynton_Events_Ushers_Training_Handbook.pdf');
const doc = new PDFDocument({ size: 'A4', margin: 0, info: {Title:'Ushers Training & Briefing Handbook', Author:'Lynton Events', Subject:'Professional event usher training'} });
doc.pipe(fs.createWriteStream(out));

const W=595.28,H=841.89;
const navy='#20263F', navy2='#151A2D', gold='#D7AE48', gold2='#F0D078', cream='#F7F2E8', ink='#202536', muted='#62697A', white='#FFFFFF', pale='#EBE4D2', red='#B74747', green='#28735C';
const logo='image-search/lynton-events-kericho-kenya-mc-team-buil-3.png';
const banner='image-search/lynton-events-kericho-kenya-mc-team-buil-2.png';
let pageNo=0;

function bg(color=cream){doc.rect(0,0,W,H).fill(color)}
function header(section, dark=false){
  doc.font('Helvetica-Bold').fontSize(8).fillColor(dark?gold2:gold).text('LYNTON EVENTS',42,27,{characterSpacing:1.8});
  doc.font('Helvetica').fillColor(dark?'#D8DCEC':muted).text(section.toUpperCase(),350,27,{width:203,align:'right',characterSpacing:1});
  doc.moveTo(42,47).lineTo(553,47).lineWidth(.6).strokeColor(dark?'#4B526D':'#D8D0BF').stroke();
}
function footer(dark=false){
  doc.font('Helvetica').fontSize(7.5).fillColor(dark?'#9AA2BE':'#878B96').text('WE MAKE IT HAPPEN',42,808,{characterSpacing:1.3});
  doc.font('Helvetica-Bold').text(String(pageNo).padStart(2,'0'),525,808,{width:28,align:'right'});
}
function addPage(opts={}){if(pageNo) doc.addPage({size:'A4',margin:0}); pageNo++; bg(opts.dark?navy:cream); if(!opts.noHeader) header(opts.section||'Ushers Training',opts.dark); if(!opts.noFooter) footer(opts.dark);}
function title(kicker, heading, sub, dark=false){
 doc.font('Helvetica-Bold').fontSize(10).fillColor(gold).text(kicker.toUpperCase(),42,76,{characterSpacing:1.8});
 doc.font('Helvetica-Bold').fontSize(31).fillColor(dark?white:ink).text(heading,42,98,{width:500,lineGap:2});
 if(sub) doc.font('Helvetica').fontSize(11).fillColor(dark?'#C9CEE0':muted).text(sub,42,177,{width:485,lineGap:4});
}
function bullet(text,y,opts={}){
 const x=opts.x||55,w=opts.w||480;
 doc.circle(x,y+6,3).fill(opts.color||gold);
 doc.font(opts.bold?'Helvetica-Bold':'Helvetica').fontSize(opts.size||11).fillColor(opts.dark?'#F3F4F8':ink).text(text,x+15,y,{width:w-15,lineGap:3});
 return doc.y+9;
}
function rule(y,color='#D8D0BF'){doc.moveTo(42,y).lineTo(553,y).lineWidth(.7).strokeColor(color).stroke()}
function card(x,y,w,h,num,head,body,dark=false){
 doc.roundedRect(x,y,w,h,10).fill(dark?'#2D3555':white);
 doc.font('Helvetica-Bold').fontSize(9).fillColor(gold).text(num,x+16,y+15,{characterSpacing:1});
 doc.font('Helvetica-Bold').fontSize(14).fillColor(dark?white:ink).text(head,x+16,y+35,{width:w-32});
 doc.font('Helvetica').fontSize(9.2).fillColor(dark?'#D9DDED':muted).text(body,x+16,y+61,{width:w-32,lineGap:3});
}
function quote(text,y,dark=false){
 doc.rect(42,y,5,82).fill(gold); doc.font('Helvetica-Oblique').fontSize(18).fillColor(dark?white:navy).text('“'+text+'”',67,y+5,{width:450,lineGap:5});
}
function twoColLists(leftTitle,left,rightTitle,right,y=225,dark=false){
 const cols=[[42,leftTitle,left],[307,rightTitle,right]];
 cols.forEach(([x,h,items])=>{doc.font('Helvetica-Bold').fontSize(13).fillColor(gold).text(h,x,y,{width:230}); let yy=y+34; items.forEach(t=>{doc.circle(x+3,yy+5,2.5).fill(gold); doc.font('Helvetica').fontSize(9.8).fillColor(dark?'#EFF1F7':ink).text(t,x+14,yy,{width:215,lineGap:2}); yy=doc.y+9;});});
}

// Cover
addPage({dark:true,noHeader:true,noFooter:true});
doc.image(banner,0,0,{width:W,height:199});
doc.rect(0,180,W,H-180).fill(navy);
doc.rect(42,225,58,5).fill(gold);
doc.font('Helvetica-Bold').fontSize(12).fillColor(gold2).text('PROFESSIONAL DEVELOPMENT SERIES',42,250,{characterSpacing:1.8});
doc.font('Helvetica-Bold').fontSize(43).fillColor(white).text('USHERS\nTRAINING &\nBRIEFING',42,292,{width:500,lineGap:0});
doc.font('Helvetica').fontSize(17).fillColor('#D5D9E7').text('A practical handbook for confident,\nprofessional event teams.',45,487,{lineGap:5});
doc.moveTo(42,589).lineTo(553,589).strokeColor('#555D7A').stroke();
doc.font('Helvetica-Bold').fontSize(11).fillColor(gold2).text('SATURDAY, 26 SEPTEMBER 2026',42,614,{characterSpacing:1});
doc.font('Helvetica').fontSize(12).fillColor(white).text('SIGOWET',42,638,{characterSpacing:2});
doc.font('Helvetica-Bold').fontSize(10).fillColor(gold).text('LYNTON EVENTS  |  WE MAKE IT HAPPEN',42,779,{characterSpacing:1.2});

// Welcome
addPage({section:'Welcome'});title('01 — Start here','The experience begins with you.','An usher is often the first human connection a guest has with an event. Your presence, preparation and attitude set the tone.');
quote('Your attitude is part of the event experience.',250);
card(42,374,155,174,'01','Be welcoming','A warm smile, eye contact and a clear greeting tell every guest: you belong here.');
card(220,374,155,174,'02','Be alert','Notice confusion, congestion and special needs early—then act or report.');
card(398,374,155,174,'03','Be professional','Stay calm, respectful, discreet and fully present throughout your assignment.');
doc.roundedRect(42,585,511,127,10).fill(navy);
doc.font('Helvetica-Bold').fontSize(12).fillColor(gold2).text('BY THE END OF THIS TRAINING',62,608,{characterSpacing:1.2});
doc.font('Helvetica').fontSize(11).fillColor(white).text('You will know how to welcome and guide guests, manage seating and movement, support VIP protocol, communicate clearly, work as one team and respond calmly when plans change.',62,638,{width:465,lineGap:5});

// Role
addPage({section:'The role'});title('02 — Identity','Who is an usher?','The first point of contact between the event and the guest.');
const traits=['WELCOMING','ALERT','PROFESSIONAL','HELPFUL','RESPECTFUL','APPROACHABLE'];
traits.forEach((t,i)=>{let col=i%2,row=Math.floor(i/2),x=42+col*263,y=236+row*105;doc.roundedRect(x,y,248,78,9).fill(white);doc.font('Helvetica-Bold').fontSize(22).fillColor(i%2?navy:gold).text(String(i+1).padStart(2,'0'),x+15,y+16);doc.font('Helvetica-Bold').fontSize(12).fillColor(ink).text(t,x+66,y+24,{characterSpacing:1});});
quote('See the person. Read the moment. Make the way clear.',585);

// Responsibilities
addPage({section:'Responsibilities'});title('03 — The assignment','Before. During. After.','Professional service starts long before the first guest arrives and continues until the final debrief.');
card(42,225,155,430,'BEFORE','Prepare','• Arrive early\n\n• Attend briefing\n\n• Learn the venue layout\n\n• Locate entrances, exits and washrooms\n\n• Check seating and signage\n\n• Identify VIP areas\n\n• Confirm emergency procedures');
card(220,225,155,430,'DURING','Serve','• Welcome every guest\n\n• Give clear directions\n\n• Assist with seating\n\n• Manage movement\n\n• Support guests who need help\n\n• Report issues early\n\n• Coordinate with security');
card(398,225,155,430,'AFTER','Close well','• Guide orderly exits\n\n• Assist with movement\n\n• Report incidents\n\n• Hand in lost property\n\n• Check your station\n\n• Join the final team debrief');

// welcome
addPage({dark:true,section:'Guest welcome'});title('04 — First impressions','The 5-second welcome.','Every guest should feel acknowledged quickly, naturally and respectfully.',true);
const steps=[['01','SMILE','Be warm and genuine.'],['02','MAKE EYE CONTACT','Show that you are present.'],['03','GREET','Use a courteous welcome.'],['04','OFFER HELP','Ask what the guest needs.']];
steps.forEach((s,i)=>{let y=237+i*105;doc.font('Helvetica-Bold').fontSize(30).fillColor(gold).text(s[0],42,y);doc.font('Helvetica-Bold').fontSize(15).fillColor(white).text(s[1],112,y+2);doc.font('Helvetica').fontSize(10.5).fillColor('#CCD1E2').text(s[2],112,y+28);rule(y+76,'#49516D');});
quote('Karibu. May I assist you with finding your seat?',681,true);

// Communication
addPage({section:'Communication'});title('05 — Language','Clear. Calm. Courteous.','Words build confidence. Choose language that reassures the guest and protects the event.');
twoColLists('USE',['Please','Thank you','Welcome','Excuse me','Kindly','May I assist you?'],'AVOID',["I don’t know.","That’s not my job.",'Arguing or shouting','Slang with guests','Negative comments about organisers'],245);
doc.roundedRect(42,555,511,132,10).fill(navy);
doc.font('Helvetica-Bold').fontSize(10).fillColor(gold2).text('SAY THIS INSTEAD',62,579,{characterSpacing:1.2});
doc.font('Helvetica').fontSize(13).fillColor(white).text('“Let me confirm that information for you.”\n\n“Let me connect you with the person who can assist you.”',62,610,{width:460,lineGap:4});

// Presentation
addPage({section:'Presentation'});title('06 — Your image','Dress the part.','You are part of the event’s image. Smart, clean and coordinated presentation inspires trust.');
const present=['Clean, neat outfit','Appropriate, comfortable shoes','Well-groomed hair','Minimal accessories','Fresh breath and good hygiene','Visible name tag or ID','Phone kept away while on duty'];
let py=238;present.forEach((t,i)=>{doc.roundedRect(42,py,511,53,7).fill(i%2?cream:white);doc.circle(66,py+26,13).fill(navy);doc.font('Helvetica-Bold').fontSize(9).fillColor(gold2).text('✓',61,py+19);doc.font('Helvetica-Bold').fontSize(11).fillColor(ink).text(t,92,py+19);py+=59;});

// Seating
addPage({dark:true,section:'Guest flow'});title('07 — Movement','Seat with confidence.','Know the map before guests need it. Consistent directions prevent confusion and congestion.',true);
twoColLists('KNOW THE AREAS',['General seating','Reserved / VIP seating','Family or special seating','Staff zones','Restricted areas','Emergency exits'],'GUIDE THE GUEST',['Face the direction of travel','Use a calm, clear instruction','Walk with the guest when possible','Keep pathways open','Never guess—confirm first','Avoid conflicting directions'],240,true);
quote('Kindly proceed this way. I will show you your seating area.',617,true);

// VIP
addPage({section:'Protocol'});title('08 — Discretion','VIP & protocol.','Excellent protocol feels effortless: respectful, calm, coordinated and never attention-seeking.');
const vip=[['KNOW','Confirm designated VIP areas and the approved arrival route.'],['COORDINATE','Work with the protocol officer; communicate changes immediately.'],['PROTECT','Avoid crowding, unnecessary announcements or public discussion.'],['ESCALATE','Pass special requests to the authorised team member.']];
vip.forEach((s,i)=>card(42+(i%2)*263,235+Math.floor(i/2)*178,248,148,String(i+1).padStart(2,'0'),s[0],s[1]));
doc.roundedRect(42,615,511,74,8).fill('#F0E2C1');doc.font('Helvetica-Bold').fontSize(10).fillColor(navy).text('IMPORTANT',61,634);doc.font('Helvetica').fontSize(10.5).fillColor(ink).text('Never change protocol arrangements independently. Act only when authorised.',145,633,{width:380});

// Difficult guests
addPage({dark:true,section:'Guest care'});title('09 — De-escalation','Keep it CALM.','The goal is not to win an argument. The goal is to protect dignity, safety and the guest experience.',true);
const calm=[['C','CONTROL','your emotions'],['A','ACKNOWLEDGE','the concern'],['L','LISTEN','carefully'],['M','MOVE','the issue to the right person']];
calm.forEach((s,i)=>{let y=228+i*94;doc.circle(76,y+30,30).fill(gold);doc.font('Helvetica-Bold').fontSize(24).fillColor(navy).text(s[0],66,y+16,{width:20,align:'center'});doc.font('Helvetica-Bold').fontSize(14).fillColor(white).text(s[1],126,y+11);doc.font('Helvetica').fontSize(11).fillColor('#CDD2E4').text(s[2],126,y+36);});
quote('I understand your concern. Let me get the event coordinator to assist you.',642,true);

// crowd
addPage({section:'Safety'});title('10 — Crowd management','Guide. Clear. Alert.','Ushers support safe movement. Ushers are not security officers.');
card(42,236,248,244,'DO','Your role','Guide guest movement\n\nPrevent unnecessary congestion\n\nKeep entrances and pathways clear\n\nDirect guests consistently\n\nAlert security when necessary');
card(305,236,248,244,'DON’T','Know the boundary','Do not physically confront a guest\n\nDo not attempt security interventions\n\nDo not leave your station silently\n\nDo not spread unconfirmed information');
doc.roundedRect(42,522,511,150,10).fill(navy);doc.font('Helvetica-Bold').fontSize(12).fillColor(gold2).text('WHEN RISK ESCALATES',63,548,{characterSpacing:1});doc.font('Helvetica').fontSize(12).fillColor(white).text('Stay at a safe distance. Notify security immediately. Give the exact location and a brief description. Continue guiding other guests only when safe to do so.',63,582,{width:460,lineGap:5});

// Emergency
addPage({dark:true,section:'Emergency response'});title('11 — Be ready','Know before you need to know.','Preparation keeps instructions calm, accurate and useful when every second matters.',true);
const know=['Emergency exits','Assembly point','First-aid location','Security personnel','Event coordinator','Communication channel'];
know.forEach((t,i)=>{let x=42+(i%2)*263,y=232+Math.floor(i/2)*81;doc.roundedRect(x,y,248,59,8).fill('#2D3555');doc.font('Helvetica-Bold').fontSize(11).fillColor(white).text(t,x+18,y+21);});
doc.font('Helvetica-Bold').fontSize(10).fillColor(gold2).text('IN AN EMERGENCY',42,510,{characterSpacing:1.5});
const chain=['STAY CALM','ALERT THE TEAM','GUIDE GUESTS','AVOID PANIC','FOLLOW THE PLAN'];
chain.forEach((t,i)=>{doc.font('Helvetica-Bold').fontSize(12).fillColor(i===4?gold2:white).text(t,42,548+i*36);if(i<4)doc.font('Helvetica').fillColor(gold).text('↓',52,570+i*36);});

// Team comms
addPage({section:'Teamwork'});title('12 — One team','Say less. Mean more.','Radio and phone communication should be short, clear, professional and relevant.');
const words=['SHORT','CLEAR','PROFESSIONAL','RELEVANT'];words.forEach((t,i)=>{doc.circle(83+i*132,275,42).fill(i%2?gold:navy);doc.font('Helvetica-Bold').fontSize(8.5).fillColor(i%2?navy:white).text(t,45+i*132,270,{width:76,align:'center',characterSpacing:.5});});
rule(360);doc.font('Helvetica-Bold').fontSize(10).fillColor(red).text('AVOID',42,391,{characterSpacing:1.4});doc.font('Helvetica-Oblique').fontSize(15).fillColor(muted).text('“There is something happening over there, maybe you should come.”',42,422,{width:500,lineGap:4});
doc.font('Helvetica-Bold').fontSize(10).fillColor(green).text('USE',42,500,{characterSpacing:1.4});doc.font('Helvetica-Bold').fontSize(20).fillColor(navy).text('“Coordinator, assistance required at the main entrance.”',42,531,{width:500,lineGap:4});

// Don't
addPage({section:'Standards'});title('13 — Boundaries','Protect the standard.','The actions you avoid are as important as the actions you take.');
const dont=['Leave your position without informing the team leader','Use your phone unnecessarily','Eat while attending to guests','Sit in guest areas while on duty','Take photos with guests without permission','Argue with guests','Share confidential event information','Drink alcohol while on duty','Give unauthorised instructions','Abandon your station'];
let dy=222;dont.forEach((t,i)=>{let x=42+(i%2)*263,y=dy+Math.floor(i/2)*84;doc.font('Helvetica-Bold').fontSize(18).fillColor(red).text('×',x,y);doc.font('Helvetica').fontSize(10).fillColor(ink).text(t,x+28,y+3,{width:205,lineGap:2});});

// Activities
addPage({dark:true,section:'Practice'});title('14 — Learn by doing','Five practical drills.','Keep simulations short. Rotate roles. Debrief what worked and what should change.',true);
const drills=[['01','THE WELCOME','Greeting, eye contact, directions, assistance'],['02','DIFFICULT GUEST','Listen, stay calm, resolve or escalate'],['03','VIP ARRIVAL','Coordinate discreetly with protocol'],['04','LOST GUEST','Clarify the need and guide professionally'],['05','ENTRY CONGESTION','Communicate, open flow and escalate risk']];
drills.forEach((s,i)=>{let y=222+i*94;doc.font('Helvetica-Bold').fontSize(23).fillColor(gold).text(s[0],42,y);doc.font('Helvetica-Bold').fontSize(12).fillColor(white).text(s[1],102,y+1,{characterSpacing:.7});doc.font('Helvetica').fontSize(9.7).fillColor('#CED3E5').text(s[2],102,y+27,{width:410});rule(y+69,'#4A526D');});

// Briefing
addPage({section:'Deployment'});title('15 — Final briefing','Know the six answers.','No usher should take a station without clarity on these essentials.');
const qs=[['WHO','is the team leader?'],['WHERE','are you stationed?'],['WHAT','is your responsibility?'],['WHEN','do you report?'],['WHO','do you report to?'],['HOW','will the team communicate?']];
qs.forEach((s,i)=>{let x=42+(i%2)*263,y=235+Math.floor(i/2)*108;doc.roundedRect(x,y,248,82,8).fill(white);doc.font('Helvetica-Bold').fontSize(11).fillColor(gold).text(s[0],x+16,y+17,{characterSpacing:1});doc.font('Helvetica').fontSize(10.5).fillColor(ink).text(s[1],x+16,y+43,{width:210});});
doc.roundedRect(42,594,511,105,10).fill(navy);doc.font('Helvetica-Bold').fontSize(10).fillColor(gold2).text('THE GOLDEN RULE',62,620,{characterSpacing:1.4});doc.font('Helvetica-Bold').fontSize(22).fillColor(white).text('SEE IT  →  ASSESS IT  →  ASSIST OR REPORT IT',62,652,{width:465});

// pledge
addPage({dark:true,section:'Commitment'});title('16 — Our promise','The usher’s pledge.',null,true);
doc.rect(42,202,5,390).fill(gold);
doc.font('Helvetica').fontSize(21).fillColor(white).text('“I will represent the event with professionalism, respect and integrity.\n\nI will welcome guests warmly, communicate clearly, work as part of a team, follow instructions and remain calm under pressure.\n\nI understand that every guest interaction contributes to the overall event experience.”',74,208,{width:440,lineGap:7});
doc.moveTo(74,646).lineTo(364,646).strokeColor('#69708A').stroke();doc.font('Helvetica-Bold').fontSize(9).fillColor(gold2).text('NAME / SIGNATURE',74,658,{characterSpacing:1.2});doc.moveTo(390,646).lineTo(522,646).strokeColor('#69708A').stroke();doc.text('DATE',390,658,{characterSpacing:1.2});

// services/back
addPage({dark:true,noHeader:true,noFooter:true});
doc.image(logo,218,55,{width:160,height:160});
doc.font('Helvetica-Bold').fontSize(28).fillColor(white).text('Make your next event\nextraordinary.',42,255,{width:510,align:'center',lineGap:3});
doc.font('Helvetica').fontSize(11).fillColor('#CCD1E0').text('One team. One standard. One unforgettable guest experience.',70,335,{width:455,align:'center'});
rule(390,'#4A526B');
doc.font('Helvetica-Bold').fontSize(10).fillColor(gold2).text('OUR SERVICES',42,420,{width:511,align:'center',characterSpacing:1.7});
doc.font('Helvetica').fontSize(11).fillColor(white).text('EVENTS MC  •  EVENT PLANNING & COORDINATION\nTEAM BUILDING  •  CORPORATE EVENTS  •  SPECIAL EVENTS\nLEADERSHIP DEVELOPMENT  •  CUSTOM WORKSHOPS',60,458,{width:475,align:'center',lineGap:9});
doc.roundedRect(86,576,423,112,10).fill('#2D3555');doc.font('Helvetica-Bold').fontSize(13).fillColor(gold2).text('LET’S MAKE IT HAPPEN',106,599,{width:383,align:'center'});doc.font('Helvetica').fontSize(11).fillColor(white).text('+254 729 474 546\nlyntoneventske@gmail.com  •  lyntonevents.com\nKericho, Kenya',106,630,{width:383,align:'center',lineGap:6});
doc.font('Helvetica').fontSize(8).fillColor('#9199B6').text('facebook.com/lyntoneventske  •  instagram.com/emceelynton',42,770,{width:511,align:'center'});

doc.end();
console.log(out);
