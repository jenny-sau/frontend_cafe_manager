const title = document.getElementById("title")
const money = document.getElementById("money")
const inventory = document.getElementById("inventory")
const catalogue = document.getElementById("catalogue")
const pending = document.getElementById("pending")
const newClient = document.getElementById("new-client")
const prepa = document.getElementById("prepa")


const state = {
    shop: {catalogue: []},
    inventory: [],
    reservedStock: {café_reserved: 0},
    player: {},
    pendingOrders: [],
    ordersReady: []
};

let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo1LCJleHAiOjE3OTE2MjE5NDR9.rV8jiJD-pvXFuRw59WU3lGqrJ4N1UVlmWr2YnE1w4mg"

async function loadProducts() {
    console.log("AVANT FETCH");

    const response = await fetch("http://127.0.0.1:8000/menu",{
                            headers: {Authorization: "Bearer " + token }
                       });
    console.log("APRÈS FETCH");
    console.log("STATUS :", response.status);

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
        id: inv.menu_item_id,
        name: inv.product_name,
        quantity: inv.quantity
    }))
    console.log("STATE.INVETOREY", state.inventory)
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


async function createClientOrder (productName){
    const product = getCatalogueProduct(productName);

    const data = {
    items: [
    {menu_item_id: product.id, quantity: 1}
            ]
                }
    console.log(data)

    const response = await fetch("http://127.0.0.1:8000/order/client", { method: "POST", 
        
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
    body: JSON.stringify(data)
});
    const result = await response.json();
    console.log("result = ", result);

    let pending_order = {
        order_id: result.order_id, 
        items: result.items}

    state.pendingOrders.push(pending_order);

    console.log("state.pendingOrder= ", state.pendingOrders)
    render()
};

newClient.addEventListener("click",() => {
        createClientOrder("café")
}
)

initShop();
initPlayer();


function render(){
    renderTitle();
    renderMoney();
    renderInventory();
    renderCatalogue();
    renderPendingOrders();
    renderKitchen();
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

function renderPendingOrders(){
    const pendingOrdersList = document.getElementById("pending");
    pendingOrdersList.textContent ="";

    state.pendingOrders.forEach(order=>{
        const img_client = document.createElement("img");
        img_client.src = "images/bonhomme.png"
        img_client.width = 80;

        const img_café = document.createElement("img");
        img_café.src = "images/café.png"
        img_café.width = 60;

        const li = document.createElement("li");
        li.textContent = `${order.items[0].quantity} ${order.items[0].menu_item_name}`;
        pendingOrdersList.appendChild(img_client)
        pendingOrdersList.appendChild(img_café)
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

    console.log("CATALOGUE :", state.shop.catalogue);

    state.shop.catalogue.forEach(item => {
        const card = createProductCard(item);
        catalogue.appendChild(card)
    });
}

function OrderReady(){
    let inv = state.inventory.find(item => item.name ==="café");
    let product = state.shop.catalogue.find(item => item.name ==="café");
    
    if (inv){

        let invDispo = inv.quantity - state.reservedStock.café_reserved;
        console.log("invDispo", invDispo)

        if (invDispo> 0)  {
        
            state.reservedStock.café_reserved += 1;
            console.log(state.reservedStock);
            console.log(state.ordersReady)

            return true
        }
        return false}
    
    return false
    
}

function renderKitchen(coffeeReady){
    const machine = document.createElement("img");
    const tasse_vide = document.createElement("img");
    const  boutou_machine = document.createElement("img");
    const coffee_ready = document.createElement("img");

    const machine_making_café = document.createElement("img");
    machine_making_café.src="images/machine_making_café.png";

    boutou_machine.src ="images/bouton.png";
    machine.src = "images/machine.png";
    tasse_vide.src = "images/tasse_vide.png";
    coffee_ready.src ="images/café.png"

    machine.width = 150;
    machine_making_café.width = 150;
    tasse_vide.width = 80;
    boutou_machine.width=60;
    coffee_ready.width=90;

    const machineContainer = document.createElement("div");
    machineContainer.classList.add("machineContainer");

    machineContainer.appendChild(machine);
    machineContainer.appendChild(boutou_machine);
    

    boutou_machine.classList.add("coffee-button");

    if (coffeeReady){
        machineContainer.appendChild(coffee_ready);
        coffee_ready.classList.add("coffee_ready")
    }

    boutou_machine.addEventListener("click", ()=> {
        
       
        if (OrderReady()) {    
        renderCoffeeMaking();
        setTimeout(() => {
            let product = state.shop.catalogue.find(item => item.name === "café");
            let ready = {id: crypto.randomUUID(), name: product.name, selling_price: product.selling_price};
            console.log(ready);
            state.ordersReady.push(ready);
            console.log("ready = ", ready);

            renderKitchen(true);
            
        },
            2000)}
        });
    
        

    
    preparation.textContent=""

    preparation.appendChild(machineContainer);


}


function renderCoffeeMaking(){
    const machine = document.createElement("img");
    const tasse_vide = document.createElement("img");
    const  boutou_machine = document.createElement("img");

    machine.src="images/machine_making_café.png";

    boutou_machine.src ="images/bouton.png";
    tasse_vide.src = "images/tasse_vide.png";

    machine.width = 150;
    tasse_vide.width = 80;
    boutou_machine.width=60;

    const machineContainer = document.createElement("div");
    machineContainer.classList.add("machineContainer");

    machineContainer.appendChild(machine);
    machineContainer.appendChild(boutou_machine);
    

    boutou_machine.classList.add("coffee-button");
    preparation.textContent=""
    preparation.appendChild(machineContainer);

}

function getCatalogueProduct(productName){
    return state.shop.catalogue.find(item => item.name ===productName)
}

function getInventoryProduct(productName){
    return state.inventory.find(item => item.name ===productName);
}


async function buyProduct(productName){
    const product = getCatalogueProduct(productName);


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

console.log("ID state :", state.inventory[0].id);
console.log("ID result :", result.menu_item_id);

const inventoryProduct = state.inventory.find(
    item => item.id === result.menu_item_id
)

inventoryProduct.quantity = result.quantity;

render();

}
