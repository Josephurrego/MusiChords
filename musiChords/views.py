from django.shortcuts import render
import requests as rq
import re
import html
import json


def index(request):
    return render(request,'index.html')

def search(request):
    def filterByType(x):
        try: 
            if (x['type']!='Pro'):return True
        except:pass
        return False
    
    def cleanData(song):
        url = song['tab_url'].replace('https://tabs.ultimate-guitar.com/tab/','')
        url = url.replace('/','+')
                 
        return {'author':song['artist_name'],'title':song['song_name'],'url':url}

    
    query = request.GET.get('q')
    url = "https://www.ultimate-guitar.com/search.php"
    params = {
        "search_type":"title",
        "value":query
    }
    data = getData(url,params)
    results = [cleanData(i) for i in list(filter(filterByType,data['store']['page']['data']['results']))]
    return render(request,'search.html',{'query':query,'data':results})

def song(request,url:str):
    url = 'https://tabs.ultimate-guitar.com/tab/'+url.replace('+','/')
    lyricsHTML,author,title,key = getSongInfo(url)
    isMinor = key.endswith('m')
    return render(request,'song.html',{'lyrics':lyricsHTML,'author':author,'title':title,'isMinor':isMinor,'keySong':key.replace('m','')})


def getData(url,params={}):
    PATTERN = r'<div\s+class="js-store"[\s\S]+<\/div>'
    res = rq.get(url,params,headers={'user-agent':'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'})
    content = re.search(PATTERN,res.text)[0]
    content = content.replace('<div class="js-store" data-content="','')
    content = content.replace('">','')
    content = content.replace('</div>','')
    
    return json.loads(html.unescape(content))

def getSongInfo(url):
    def cleanContent(content):
        content = content.replace('\r','')
        content = content.replace('[/tab]','')
        content = content.replace('[tab]','')
        content = content.replace('\n','</span>\n<span>')
        content = content.replace('[/ch]','</b>')
        content = content.replace('[ch]','<b>')
        content = '<pre class="content"><span>'+content+"</span></pre>"
        return content
    data = getData(url)['store']['page']['data']
    with open('file.json','w') as file:
        file.write(json.dumps(data))
    lyrics = data['tab_view']['wiki_tab']['content']
    lyrics = cleanContent(lyrics)
    return lyrics,data['tab']['artist_name'],data['tab']['song_name'],data['tab']['tonality_name']