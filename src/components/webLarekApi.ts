import { IOrder, IProductItem, ISuccess } from '../types';
import { Api, ApiListResponse } from './base/api';

export interface IWebLarekAPI {
    getProductList: () => Promise<IProductItem[]>;
    orderResult: (order: IOrder) => Promise<ISuccess>;
    getProductById: (id: string) => Promise<IProductItem>;
}

export class WebLarekAPI extends Api {
	readonly cdn: string;

	constructor(cdn: string, baseUrl: string) {
		super(baseUrl);
		this.cdn = cdn;
	}

	getProductById(id: string): Promise<IProductItem> {
		return this.get(`/product/${id}`).then((data: IProductItem) => ({
			...data,
			image: this.cdn + data.image,
		}));
	}

	getProductList(): Promise<IProductItem[]> {
		return this.get(`/product`).then((data: ApiListResponse<IProductItem>) =>
			data.items.map((item) => ({
				...item,
				image: this.cdn + item.image,
			}))
		);
	}

	orderResult(order: IOrder): Promise<ISuccess> {
		return this.post(`/order`, order).then((data: ISuccess) => data);
	}
}