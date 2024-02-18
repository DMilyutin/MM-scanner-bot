function getTarifs(): Tarifs{
    return {
        tarifBase: {
            name: 'Базовый',
            price: 149,
            paymentDay: 30,
            productLimit: 10
        },
        tarifProfi: {
            name: 'Профи',
            price: 249,
            paymentDay: 30,
            productLimit: 50
        },
        tarifTrial: {
            name: 'Пробный',
            price: 0,
            paymentDay: 7, // todo изменить на 7
            productLimit: 2
        },
    }
}

class Tarifs {
    tarifBase: {
        name: string
        price: number
        paymentDay: number
        productLimit: number
    }
    tarifProfi: {
        name: string
        price: number
        paymentDay: number
        productLimit: number
    }
    tarifTrial: {
        name: string
        price: number
        paymentDay: number
        productLimit: number
    }
}

export default {Tarifs, getTarifs}

