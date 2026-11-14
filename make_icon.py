# Draws icon.png (180) and icon-512.png for the home-screen shortcut.
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter
S=1024
img=Image.new("RGB",(S,S))
px=img.load()
for y in range(S):
    for x in range(S):
        t=(x+y)/(2*S)
        px[x,y]=(int(255-10*t),int(226+4*t),int(238-18*t))  # soft pink -> peach
d=ImageDraw.Draw(img,"RGBA")
f=ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Rounded Bold.ttf",470)
cols=[(255,120,150),(255,170,70),(90,190,150)]
txt="123"
# measure and centre
widths=[d.textlength(c,font=f) for c in txt]
total=sum(widths)-40
x=(S-total)/2; y=250
sh=Image.new("RGBA",(S,S),(0,0,0,0)); sd=ImageDraw.Draw(sh)
xx=x
for c,w,col in zip(txt,widths,cols):
    sd.text((xx+8,y+14),c,font=f,fill=(120,60,80,90)); xx+=w-20
sh=sh.filter(ImageFilter.GaussianBlur(14)); img.paste(sh,(0,0),sh)
d=ImageDraw.Draw(img,"RGBA")
xx=x
for c,w,col in zip(txt,widths,cols):
    d.text((xx,y),c,font=f,fill=col,stroke_width=14,stroke_fill=(255,255,255)); xx+=w-20
def star(cx,cy,r,col):
    pts=[]
    for i in range(8):
        a=i*math.pi/4; rr=r if i%2==0 else r*0.28
        pts.append((cx+rr*math.sin(a),cy-rr*math.cos(a)))
    d.polygon(pts,fill=col)
def heart(cx,cy,r,col):
    d.ellipse((cx-r,cy-r,cx,cy),fill=col); d.ellipse((cx,cy-r,cx+r,cy),fill=col)
    d.polygon([(cx-r,cy-r*0.4),(cx+r,cy-r*0.4),(cx,cy+r*0.95)],fill=col)
star(190,190,70,(255,255,255,235)); star(840,170,50,(255,214,102,255)); star(860,850,62,(255,255,255,235))
heart(170,850,48,(255,140,170,255)); star(520,120,34,(255,255,255,220)); heart(520,880,34,(255,190,90,255))
img.resize((180,180),Image.LANCZOS).save("icon.png")
img.resize((512,512),Image.LANCZOS).save("icon-512.png")
