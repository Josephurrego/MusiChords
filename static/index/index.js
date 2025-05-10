function search(query){
    if (query.value==='')return;
    window.location.href = '/search?'+new URLSearchParams({q:query.value})
}

document.addEventListener('DOMContentLoaded',()=>{
    const buttonSearch = document.querySelector('.search-button');
    const inputSearch = document.querySelector('.search-input');
    buttonSearch.addEventListener('click',()=>search(inputSearch))
    inputSearch.addEventListener('keypress',(e)=>{
        if (e.key==="Enter"){
            search(inputSearch);
        }
    })
})