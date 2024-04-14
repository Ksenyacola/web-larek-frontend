export interface IProduct {
    id: string;
    category: 'софт-скил' | 'другое' | 'дополнительное' | 'кнопка';
    title: string;
    price: number | null;
    imageUrl: string;
    ordered: boolean;
    addToBasket: () => void;
    deleteFromBasket: () => void;
  }


// Интерфейс базовой формы заказа
export interface IBaseOrderForm {
    payment: string;
    address: string;
  }

  // Интерфейс формы с контактными данными
  export interface IOrderContactsForm {
    email: string;
    phone: string;
  }


  // Объединенный интерфейс формы
  type IOrderForm = IOrderContactsForm & IOrderContactsForm;

  // Интерфейс заказа
  export interface IOrder extends IOrderForm {
    items: IProduct[];
    validation(): void;
    clearOrder(): void;
    postOrder(): void;
  }

  // Интерфейс состояния приложения
  export interface IAppState {
    catalog: IProduct[];
    basket: IProduct[];
    order: IOrder;
    preview: IProduct;
    checkProductBasket(): boolean;
    clearBasket(): void;
    getTotal(): number;
    getBasketIds(): number;
    getBasketLength(): number;
    initOrder(): IOrder;
  }
