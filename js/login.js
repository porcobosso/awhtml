var wax = new waxjs.WaxJS('https://wax.greymass.com', null, null, false);
async function serverLogin(){
    try {
        const userAccount = await wax.login();
        document.getElementById("account").innerHTML = userAccount;
        return true;
    } catch(error) {
        console.error(error);
        return false;
    }
}