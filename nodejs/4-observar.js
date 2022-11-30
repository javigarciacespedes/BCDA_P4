
let Web3 = require("web3");  // Cargar paquete web3

// Usar Provider: GANACHE 
let web3 = new Web3("ws://localhost:7545");

(async () => {
    try {

        const abi = require("./abi.json");

        const addr = "0xf2F5362d0Ec3772dAAcbc1Fc25C960F0501090E3";

        let myContract = new web3.eth.Contract(abi, addr);

        myContract.events.Tic()
        .on("error", error => {
            console.log("Se ha producido un ERROR en evento Tic:", error);
            process.exit(2);
        })
        .on('data', event => {
            console.log("Se ha producido un evento Tic:");
            console.log(" * Msg =", event.returnValues.msg);
            console.log(" * Out =", event.returnValues.out);
        });

    } catch(error) {
        console.log("Error =", error);
        process.exit(1);
    }
})();
