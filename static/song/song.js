let CHORDS;
let lineSelected;
let infoOptionWidth;
let infoOption;
        

const CHORDS_ARR =  ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']

window.onload = ()=>{
    sortLyricsLines();
    initStylesListeners();
    initFunctionalListeners();
    initScaleDetection();
}

function sortLyricsLines(){
    document.querySelectorAll('.tablatura').forEach((el)=>{
        el.parentElement.remove()
    })

    chords = Array.from(document.getElementsByTagName('b')).map((el,idx)=>{
        el.id = `CH-${idx}`
        return el.textContent;
    })


    const preHtml = document.querySelector('pre')    
    const spanArray = Array.from(preHtml.getElementsByTagName('span'))
    spanArray.forEach((el)=>{
        if (el.textContent===''){
            return
        }
        if (el.getElementsByTagName('b').length===0){
            el.classList.add('text-line')
            return;
        }
        el.classList.add('chords-line')
    })

    spanArray.forEach((el)=>{
        if(el.classList[0]!=='chords-line'){
            return
        }
        const parentGroup = document.createElement('div');
        const nextSibling = el.nextElementSibling
        el.oldSibling = el.nextSibling
        preHtml.replaceChild(parentGroup,el);
        parentGroup.appendChild(el);
        parentGroup.append('\n')
        
        if (nextSibling===null)return;
        preHtml.removeChild(el.oldSibling)

        if(nextSibling.classList[0]==='text-line'){
            nextSibling.remove()
            parentGroup.appendChild(nextSibling)
        }
    })
}

function initStylesListeners(){
    notesListeners();
    headersOptionsListeners();
    scrollLinesClick();
    scrollSnapObserver()
    
    document.querySelector('.content>div').scrollIntoView({block:'center', behavior: 'smooth'}) // Select the firs line on focus
    
    infoOption = document.querySelector('.info-div .option-content')
    infoOptionWidth = infoOption.scrollWidth
    infoOption.style = `width:${infoOptionWidth}px`

    const header = document.querySelector('.header')
    header.parentElement.style.setProperty('--header-height',header.scrollHeight+'px')
}

function initFunctionalListeners(){
    notesClickListeners();
    const searchDiv = document.querySelector('.search-div')
    document.querySelector('.search-div .icon-div').addEventListener('click',(e)=>{search(searchDiv)})

    document.querySelector('.info-div .icon-div').addEventListener('click',returnHome)
}

function returnHome(){
    if(!document.querySelector('.info-div').parentElement.classList.contains('focused-header'))return;
    window.location.href = '/'
}

function search(searchDiv){
    if (!searchDiv.classList.contains('focused-header'))return;
    const query = document.querySelector('.search-input')
    if (query.value==='')return;
    window.location.href = '/search?'+new URLSearchParams({q:query.value})
}

function notesListeners(){
    const array = document.querySelectorAll('.notes-list .note')
    
    function onEvent(e){
        const toneBg = document.querySelector('.focused-header .tone-bg')
        if (toneBg===null)return
        toneBg.style = `translate:${e.target.offsetLeft+5}px;height:40px;width:40px;top:6px`
    }
    function offEvent(){
        const toneBg = document.querySelector('.focused-header .tone-bg')
        if (toneBg===null)return
        toneBg.style = ''
    }

    array.forEach((el)=>{
        el.addEventListener('mouseover',onEvent)
        el.addEventListener('mouseout',offEvent)
        el.addEventListener('focus',onEvent)
        el.addEventListener('focusout',offEvent)
    })
}

function headersOptionsListeners(){
    const listOptions = document.querySelectorAll('.option-header')
    listOptions.forEach((el)=>{
        el.addEventListener('click',()=>{
            const currentSelected = document.querySelector('.focused-header');
            if (el===currentSelected)return;
            currentSelected.classList.remove('focused-header');
            el.classList.add('focused-header');
            infoOption.style = null;
            if (el.querySelector('.info-div')!==null){
                infoOption.style = `width:${infoOptionWidth}px`
            }
        })
    })
}

function notesClickListeners(){
    const array = document.querySelectorAll('.notes-list .note')
    array.forEach((el)=>{
        el.addEventListener('click',()=>{
            const oldKeyButton = document.querySelector('.selected')
            oldKeyButton.classList.remove('selected')
            el.classList.add('selected')
            changeKey(oldKeyButton.id,el.id)
        })
    })
}

function changeKey(oldKey,newKey){
    const distance = Tonal.Interval.distance(oldKey,newKey)
    document.querySelectorAll('b').forEach(el => {
        el.textContent = Tonal.Chord.transpose(el.textContent,distance);
    });

}

function scrollSnapObserver(){
    const linesContent = document.querySelectorAll('.content>div')
    const lyricsDiv = document.querySelector('.lyrics-div')
    lyricsDiv.style='';
    const options = {
        root: lyricsDiv, // default, use viewport
        rootMargin: '-40% 0px',
        threshold: 0.5 // half of item height
    }
    const observer = new IntersectionObserver((entries,showOnScroll) => {
        entries.forEach((entry)=>{
            if(entry.isIntersecting){

                entry.target.classList.add('line-selected')
            }else {
                entry.target.classList.remove('line-selected')
            }
        })
    },options)
    linesContent.forEach((el=>observer.observe(el)))
}

function scrollLinesClick(){
    const linesArray = document.querySelectorAll('.content>div')
    linesArray.forEach((el)=>{
        el.addEventListener('click',()=>{
            el.scrollIntoView({block:'center', behavior: 'smooth'})
        })
    })
}

function initScaleDetection(){
    var tonic = document.querySelector('.notes-list').getAttribute('data-key');
    
    if(!tonic){
        var progression = [];
        document.querySelectorAll('b').forEach((chordHtml)=>{
            progression = progression.concat(Tonal.Chord.get(chordHtml.textContent).notes);
        });
        progression = new Set(changeBemolToSharp(progression));
        tonic = detectScale(progression);
    }
    console.log(tonic)
    showTonic(tonic);
};

function changeBemolToSharp(progression){
      return progression.map(note=>note.endsWith('b')?Tonal.Note.enharmonic(note):note)
}

function detectScale(progression) {
    progression = new Array(...progression);
    console.log(progression)
    const chromaticScale = changeBemolToSharp(Tonal.Scale.get('C Chromatic').notes);
    let aproxMatch = { length: 0 }
    for (let scaleIdx = 0; scaleIdx < chromaticScale.length; scaleIdx++) {
        const actualScale = Tonal.Scale.get(`${chromaticScale[scaleIdx]} major`).notes
        const results = progression.filter(note => {
            return actualScale.includes(note)
        });
        console.log(chromaticScale[scaleIdx], results)
        if (results.length === progression.length) {
            return chromaticScale[scaleIdx]
        }
        if (results.length > aproxMatch.length) {
            aproxMatch = { length: results.length, scale: chromaticScale[scaleIdx] }
        }
    }
    return aproxMatch.scale
}

function showTonic(key){
    document.querySelector(`.note#${key}`).classList.add('selected');
};
