window.onload = ()=>{
    console.log('asdf')
    document.querySelectorAll('.result-div').forEach((el)=>{
        el.addEventListener('click',resultOnClick)
    })
    document.querySelector('.search-button').addEventListener('click',search)
}


function search(){
    const query = document.querySelector('.search-input')
    if (query.value==='')return;
    window.location.href = '/search?'+new URLSearchParams({q:query.value})
}

function resultOnClick(e){
    let id;
    if (e.target.tagName==='DIV'){
        id = e.target.id
    }else {
        id = e.target.parentElement.id
    }
    window.location.href ='/song/'+id
}