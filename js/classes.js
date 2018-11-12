class Person {
    constructor(name, age, street, city) {
        this.name = name;
        this.age = age;
        this.street = street;
        this.city = city;
        this.address = this.street + " " + this.city;
    }
}

class Profile extends Person {
    constructor(id, name, age, street, city, picture){
        super(name, age, street, city);
        this.id = id;
        this.picture = picture;
        this.coordinates = {
            longitude: 0,
            latitude: 0
        };
        this.distance = 0;
    }
}