class Person {
    constructor(name, address) {
        this.name = name;
        this.address = address;
    }

    showInfo(){
        console.log(this.name + " - " + this.address);
    }
}