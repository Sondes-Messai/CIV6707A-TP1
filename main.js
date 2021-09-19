//création d'une fonction qui permet l'ajout d'un bus dans la base de donnée busDB



const busDB = [];
const addBus = function(id, license, make, model, seatCount, standingCount, doorCount, accessCount) {
    const bus = {
        id : id,
        license : license,
        make : make,
        model : model,
        seatCount : seatCount,
        standingCount : standingCount,
        doorCount : doorCount,
        accessCount : accessCount
    }; 
    busDB.push(bus);
    return bus;
};