const title = document.getElementById("title")
const money = document.getElementById("money")
const inventory = document.getElementById("inventory")
const catalogue = document.getElementById("catalogue")

const state = {
    shop: {
        catalogue: []
    },
    inventory: [],
    player: {
        name: "Vic",
        money: 1000,
        level: 1,
        inventory: []
        }
 
};

async function loadProducts() {
    const response = await fetch("http://127.0.0.1:8000/menu",{
                            headers: {Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo1LCJleHAiOjE3ODk1MzE1Mjh9.wE6pVVyauGy98ttdpNvyFDEHcQQuo7XQKnooPFx5tmk"}
                       });

    if (!response.ok) {
    throw new Error("Erreur API")};

    const products = await response.json();

    return products
}

async function loadPlayer(){
    const response = await fetch("http://127.0.0.1:8000/game/stats", {
                            headers: {Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo1LCJleHAiOjE3ODk1MzE1Mjh9.wE6pVVyauGy98ttdpNvyFDEHcQQuo7XQKnooPFx5tmk"}
                       });
    if (!response.ok) {
    throw new Error("Erreur API")};

    const player = await response.json();

    return player
}

     
async function initShop() {
    console.log("1 - initShop");
    const product = await loadProducts();
    console.log("2 - produits reçus :", product);
    console.log("TYPE :", typeof product);
    console.log("EST UN TABLEAU :", Array.isArray(product));
    state.shop.catalogue = product.items;
    state.inventory = state.shop.catalogue.map(item => ({
        name: item.name,
        quantity: 0
    }));
    console.log(product);
    console.log("PRODUIT COMPLET :", product);
    render();
}
async function initPlayer(){
    const player = await loadPlayer();
    state.player = player.player;
    console.log("PLAYER REÇU :", player);
    render()
}

initShop();
initPlayer();




function render(){
    renderTitle();
    renderMoney();
    renderInventory();
    renderCatalogue();
}

function renderTitle(){
    title.textContent = "Bonjour " + state.player.username;
}

function renderMoney(){
    money.textContent = "Money: " + state.player.current_money;
}

function renderInventory() {
    inventory.textContent = "";

    state.inventory.forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.name}: ${item.quantity}`;

        inventory.appendChild(li)
    })
}

function createProductCard(product){
    const card = document.createElement("div");
    
    const p = document.createElement("p");
    p.textContent = `${product.name} - Prix d'achat: ${product.purchase_price}$ - Prix de vente: ${product.selling_price}$`;

    const buttonBuy = document.createElement("button");
    const buttonSell = document.createElement("button")

    buttonBuy.textContent = `Buy ${product.name}`;
    buttonSell.textContent = `Sell ${product.name}`;

    buttonBuy.addEventListener("click", function(){
        buyProduct(product.name);
        })

    buttonSell.addEventListener("click", function(){
        sellProduct(product.name);
    })

    card.appendChild(p);
    card.appendChild(buttonBuy);
    card.appendChild(buttonSell);

    return card;
}

function renderCatalogue (){
    catalogue.textContent ="";

    state.shop.catalogue.forEach(item => {
        const card = createProductCard(item);
        catalogue.appendChild(card)
    });
}

function getCatalogueProduct(productName){
    return state.shop.catalogue.find(item => item.name ===productName)
}

function getInventoryProduct(productName){
    return state.inventory.find(item => item.name ===productName);
}


function buyProduct(productName){
    const product = getCatalogueProduct(productName);
    const inventoryProduct = getInventoryProduct(productName);



    if (product){
        if (state.player.current_money >= product.purchase_price) {
            state.player.current_money -= product.purchase_price;
            inventoryProduct.quantity += 1;
            render();
        } else {
        alert("Pas assez d'argent")
    }
    }else {
        alert("Le produit n'existe pas au catalogue")
    }
}

function sellProduct(productName){
    const product = getCatalogueProduct(productName);
    const inventoryProduct = getInventoryProduct(productName);
    if (product && inventoryProduct && inventoryProduct.quantity > 0) {
        state.player.current_money += product.selling_price ;
        inventoryProduct.quantity -= 1;
        render();
    } else {
        alert("Produit pas en stock")
    }
}


async function getProducts() {
    const response = await fetch("http://127.0.0.1:8000/menu");


    console.log(response);
    console.log(response.status);
    console.log(response.ok);
    const data = await response.json();
    console.log(data);
}

//getProducts();

