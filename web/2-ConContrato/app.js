
// https://cdn.esm.sh/web3@1.8.0
import Web3 from 'https://cdn.esm.sh/v92/web3@1.8.0/es2022/web3.js';

const chainId = "0x539"; // Ganache: es donde he desplegado el contrato

let web3 = null;  // Creare mi propio objeto web3, de la version 1.6.0

// Direcion de la red Ganache donde hemos desplegado el contrato Contador.
const addr = "0xf2F5362d0Ec3772dAAcbc1Fc25C960F0501090E3"; 

let contador = null;  // Instancia desplegada del contrato

const init = async () => {
    console.log("Inicializando..");

    // Comprobar que el navegador soporta Ethereum
    if (typeof window.ethereum === "undefined") {
        alert("Instale MetaMask para usar esta aplicación.");
        return;
    }
    try {
        console.log("Configurando el manejo de cambio de red");
        ethereum.on('chainChanged', chainId => {
            // Recargar la pagina
            console.log("Seleccionada otra red.");
            window.location.reload();
        });

        console.log("Configurar cambio de cuenta selecionada");
        ethereum.on('accountsChanged', accs => {
            // Recargar el UI con la primera cuenta
            console.log("Seleccionada otra cuenta =", accs[0]);
            document.getElementById('cuenta').innerHTML = accs[0];
        });

        // Comprobar si MetaMask está conectado a la red deseada:
        const cid = await ethereum.request({method: 'eth_chainId'});
        if (cid !== chainId) {
            alert('Debe conectar MetaMask a Ganache.');
            return;
        }

        // Creo mi instancia de web3
        web3 = new Web3(ethereum);

        console.log("web3 =", web3.version);

        console.log("Obtener el ABI del contrato Contador.");
        const response = await fetch('abi.json');
        const abi = await response.json();

        console.log("Obtener instancia desplegada del contador.");
        contador = new web3.eth.Contract(abi, addr);

        console.log("Configurar Vigilancia del evento Tic.");
        contador.events.Tic()
            .on("error", error => {
                console.log("ERROR en evento Tic:", error);
            })
            .on('data', event => {
                console.log("Se ha producido un evento Tic:");
                console.log(" * Msg =", event.returnValues.msg);
                console.log(" * Out =", event.returnValues.out);
                document.getElementById('valor').innerHTML = event.returnValues.out;
            });

        // ROUTER de eventos
        console.log("Configurando manejadores de eventos.");
        const matchEvent = (ev, sel) => ev.target.matches(sel);
        document.addEventListener('click', ev => {
            if (matchEvent(ev, '#cincr')) handleIncr(ev);
            else if (matchEvent(ev, '#login')) handleLogin(ev);
            else if (matchEvent(ev, '#cset2')) handleSet(ev);
        });

        refreshContador();
        refreshAccount();

    } catch (error) {
        alert('Se ha producido un error inesperado: ' + error);
    }
};

const handleLogin = async event => {
    // Hacer login en MetaMask para acceder a las cuentas

    console.log("Se ha hecho Click en el botón de Login.");

    event.preventDefault();

    refreshAccount();
};

const handleIncr = async event => {
    console.log("Se ha hecho Click en el botón de incrementar.");

    event.preventDefault();

    try {
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];

        if (!account) {
            alert('No se puede acceder a las cuentas de usuario.');
            return;
        }
        console.log("Cuenta =", account);

        // Ejecutar incr como una transacción desde la cuenta account.
        await contador.methods.incr().send({
            from: account,
            gas: 200000
        });
    } catch (error) {
        console.log(error);
    }
};

const handleSet = async event => {
    console.log("Se ha hecho Click en el botón de Set.");

    event.preventDefault();

    try {
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];

        if (!account) {
            alert('No se puede acceder a las cuentas de usuario.');
            return;
        }
        console.log("Cuenta =", account);

        // Ejecutar set como una transacción desde la cuenta account.
        await contador.methods.set(Number(document.getElementById("cset1").value)).send({
            from: account,
            gas: 200000
        });
    } catch (error) {
        console.log(error);
    }
};

const refreshContador = async () => {
    console.log("Refrescando el valor mostrado del contador.");

    try {
        const valor = await contador.methods.valor().call()

        console.log("Valor =", valor);

        document.getElementById('valor').innerHTML = valor;

    } catch (error) {
        console.log(error);
    }
};

const refreshAccount = async () => {
    console.log("Refrescando la cuenta mostrada.");

    try {
        const accounts = await ethereum.request({method: 'eth_requestAccounts'});
        const account = accounts[0];

        console.log("Logueado con la cuenta =", account);
        document.getElementById('cuenta').innerHTML = account;

    } catch (error) {
        console.log(error);
    }
};

// Inicialización: Ejecutar cuando se ha terminado de cargar la pagina.
//document.addEventListener('DOMContentLoaded', init);
window.addEventListener('load', init);

