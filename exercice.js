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

        }
 
};

let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo1LCJleHAiOjE3ODk4ODMwMzZ9.7lMHZ9g6so3crPezuPnZMMVuBK_RwkwW4DV6IdS8-k8"

async function loadProducts() {
    const response = await fetch("http://127.0.0.1:8000/menu",{
                            headers: {Authorization: "Bearer " + token }
                       });

    if (!response.ok) {
    throw new Error("Erreur API")};
    const products = await response.json();
    return products
}

async function loadPlayer(){
    const response = await fetch("http://127.0.0.1:8000/game/stats", {
                            headers: {Authorization: "Bearer " + token }
                       });
    if (!response.ok) {
    throw new Error("Erreur API")};
    const player = await response.json();
    return player
}

async function loadInventory(){
    const response = await fetch("http://127.0.0.1:8000/inventory", {
                        headers: {Authorization: "Bearer " + token }
                        });
    if (!response.ok) {
    throw new Error("Erreur API")};

    const inventory = await response.json();
    return inventory
    
}
     
async function initShop() {
    console.log("1 - initShop");
    const product = await loadProducts();
    const inventory = await loadInventory();
    console.log("INVENTAIRE REçU :", inventory)

    console.log("2 - produits reçus :", product);
    console.log("TYPE :", typeof product);
    console.log("EST UN TABLEAU :", Array.isArray(product));
    state.shop.catalogue = product.items;
    
    state.inventory = inventory.items.map(inv => ({
        name: inv.product_name,
        quantity: inv.quantity
    }))
  
    console.log(product);
    console.log("PRODUIT COMPLET :", product);
    render();
}
async function initPlayer(){
    const player = await loadPlayer();
    state.player = player.player;
    console.log("PLAYER REÇU :", player);
    console.log("STATE PLAYER :", state.player);
    console.log("MONEY :", state.player.current_money);
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


async function buyProduct(productName){
    const product = getCatalogueProduct(productName);
    const inventoryProduct = getInventoryProduct(productName);

        const data = {
        menu_item_id: product.id,
        quantity: 1
    }
    console.log(data)


    const response = await fetch("http://127.0.0.1:8000/order/restock", {
        method: "POST",

        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
    },
        body: JSON.stringify(data)
        });
        
    if (!response.ok) {
    console.log(response.status);
    throw new Error("Erreur API");
}
const result = await response.json();
console.log("RÉPONSE DU POST :", result);
initShop()
render()

}

async function sellProduct(productName){
    const product = getCatalogueProduct(productName);
    const inventoryProduct = getInventoryProduct(productName);

    const data = {
        menu_item_id: product.id,
        quantity: 1
    }

    const response = await fetch("http://127.0.0.1:8000/order/client", {
        method: "POST",

        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
    },
        body: JSON.stringify(data)
        });
        
        if (!response.ok) {
        console.log(response.status);
        throw new Error("Erreur API");
        }

    initShop()
    render()

}