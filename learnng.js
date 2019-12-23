function getName() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve('name printed');
        }, 3000);
    })
}
function getSrname() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve('surname printed');
        }, 500);
    })
}
async function getNameStatus() {
    console.log('printing name...');
    const status = await getName();
    const status2 = await getSrname();
    console.log('status : ', status);
    console.log('status : ', status2);
}

getNameStatus();
getSrname();