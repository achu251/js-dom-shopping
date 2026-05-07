let Apilink="https://fakestoreapi.com/products/"


setTimeout((Apilink)=>{
    console.log("loading....");
},5000)

fetch(Apilink)
.then((data)=>{
    return data.json()
})

.then((objectdata)=>{
    let api=document.querySelector(".api")
    objectdata.forEach((a,b,c)=> {
        console.log(a);

        let dynamictag=document.createElement("div")
        dynamictag.innerHTML=`<h1>${a.title.slice(0,50)}</h1><img src="${a.image}" alt="${a.category}
        <p>"${a.price}"</p><p>"${a.description.slice(0,60)}"</p>`

        api.append(dynamictag)
        
    })

})