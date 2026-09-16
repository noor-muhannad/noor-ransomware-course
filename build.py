"""Build bundled lesson content using Python's standard library."""
from pathlib import Path
import re, html, json
ROOT=Path(__file__).resolve().parent
def inline(s):
 s=html.escape(s)
 s=re.sub(r'\[([^\]]+)\]\((https://[^)]+)\)',r'<a href="\2" target="_blank" rel="noopener noreferrer">\1 ↗</a>',s)
 s=re.sub(r'`([^`]+)`',r'<code dir="ltr">\1</code>',s)
 return re.sub(r'\*\*([^*]+)\*\*',r'<strong>\1</strong>',s)
def render(src):
 out=[];p=[];table=[];code=None;listed=False
 def flush():
  nonlocal p,table,listed
  if p:out.append('<p>'+inline(' '.join(p))+'</p>');p=[]
  if listed:out.append('</ol>');listed=False
  if table:
   rows=[r.strip().strip('|').split('|') for r in table]
   out.append('<div class="table-wrap"><table><thead><tr>'+''.join('<th>'+inline(c.strip())+'</th>' for c in rows[0])+'</tr></thead><tbody>')
   for row in rows[2:]:out.append('<tr>'+''.join('<td>'+inline(c.strip())+'</td>' for c in row)+'</tr>')
   out.append('</tbody></table></div>');table=[]
 for line in src.splitlines():
  if line.startswith('```'):
   if code is None:flush();code=[]
   else:out.append('<pre dir="ltr"><code>'+html.escape('\n'.join(code))+'</code></pre>');code=None
   continue
  if code is not None:code.append(line);continue
  if line.startswith('|'):
   if p or listed:flush()
   table.append(line);continue
  if table:flush()
  if not line.strip():flush();continue
  m=re.match(r'^(#{1,3}) (.+)',line)
  if m:
   flush();tag='h3' if len(m[1])==3 else 'h2';out.append('<'+tag+'>'+inline(m[2])+'</'+tag+'>');continue
  m=re.match(r'^\d+\. (.*)',line)
  if m:
   if p:out.append('<p>'+inline(' '.join(p))+'</p>');p=[]
   if not listed:out.append('<ol>');listed=True
   out.append('<li>'+inline(m[1])+'</li>');continue
  p.append(line)
 flush();return '\n'.join(out)
s=(ROOT/'course.md').read_text()
parts=re.split(r'^## (.+)\n',s,flags=re.M)
sections=[]
for i in range(1,len(parts),2):
 title,body=parts[i],parts[i+1]
 if title.startswith('كورس عربي'):continue
 m=re.match(r'المحاضرة (\d+): (.+)',title)
 section={'id':f'lesson-{m[1]}' if m else f'resource-{i}', 'title':m[2] if m else title, 'number':int(m[1]) if m else None,'html':render(body),'text':body}
 sections.append(section)
assert len([x for x in sections if x['number']])==10
(ROOT/'content.js').write_text('window.COURSE = '+json.dumps(sections,ensure_ascii=False)+';\n')
print('Built',len(sections),'sections; 10 lectures.')
