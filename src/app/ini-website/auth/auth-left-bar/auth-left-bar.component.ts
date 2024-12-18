import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-auth-left-bar',
  templateUrl: './auth-left-bar.component.html',
  styleUrls: ['./auth-left-bar.component.scss']
})
export class AuthLeftBarComponent implements OnInit {

  slides = [
    {
      id: '1000',
      code: 'f230fh0g3',
      name: 'Bamboo Watch',
      description: 'Product Description',
      image: 'bamboo-watch.jpg',
      price: 65,
      category: 'Accessories',
      quantity: 24,
      inventoryStatus: 'INSTOCK',
      rating: 5
  },
  {
      id: '1002',
      code: 'zz21cz3c1',
      name: 'Blue Band',
      description: 'Product Description',
      image: 'blue-band.jpg',
      price: 79,
      category: 'Fitness',
      quantity: 2,
      inventoryStatus: 'LOWSTOCK',
      rating: 3
  },

  ];


  constructor() {

  }

  ngOnInit() {

  }

}
