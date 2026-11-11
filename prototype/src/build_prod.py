import re,os
h=open('head.html').read()
d1=open('data.js').read(); d2=open('data2.js').read(); d3=open('data3.js').read(); a=open('app.js').read()
# no prototype banner
h=h.replace('<div class="banner" role="note"><div class="wrap" id="banner"></div></div>\n','')
a=a.replace("document.getElementById('banner').textContent=PROTO?X(T.banner):'';if(!PROTO)document.getElementById('banner').parentNode.parentNode.style.display='none';","")
a=a.replace("var PROTO=true; /* prototype-only banner and Internal page: set to false / delete for production */","var PROTO=false;")
a=a.replace("['plan','社内メモ','Internal']","")
a=re.sub(r"T\.nav\.filter\(function\(n\)\{return PROTO\|\|n\[0\]!=='plan'\}\)\.map\(","T.nav.map(",a)
# drop Internal page + corrections page + routes
a=re.sub(r"function plan\(\)\{.*?\n(?=function corrections)","",a,flags=re.S)
a=re.sub(r"function corrections\(\)\{.*?\n(?=function render)","",a,flags=re.S)
a=a.replace("else if(h==='plan')html=plan();else if(h==='corrections')html=corrections();","")
# drop internal data
a=re.sub(r"\nvar P=\[.*?\n\];\n","\n",a,flags=re.S)
a=re.sub(r"P=P\.filter\(.*?\n","",a)
d1=re.sub(r"/\* Internal term map[^\n]*\*/\n","",d1)
d1=re.sub(r"var TM=\[.*?\n\];","",d1,flags=re.S)
d2=re.sub(r"/\* internal plan additions \*/\nvar P2=\[.*?\n\];","",d2,flags=re.S)
d2=re.sub(r"/\* upcoming events.*?var EVT=\{[^\n]*\};","",d2,flags=re.S)
d3=re.sub(r"var P3=\[.*?\n\];","",d3,flags=re.S)
# remove internal/prototype UI strings from T
a=re.sub(r"\n banner:\[.*?\],\n","\n",a,count=1)
a=re.sub(r" statNote:\[.*?\],\n","",a,count=1)
a=re.sub(r"\n planH:\[.*?\n planP:\[.*?\],","",a,count=1)
a=re.sub(r"\n cols:\[\[.*?\]\],?\n","\n",a,count=1)
# strip internal log notes (3rd element) from client data
a=a.replace("document.title='旅アフィリ・ラボ';","document.title='旅アフィリ・ラボ';")
out=h+d1+d2+d3+a+"\n</script>\n"
os.makedirs('prod',exist_ok=True)
open('prod/index.html','w').write(out)
