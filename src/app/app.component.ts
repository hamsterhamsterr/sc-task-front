import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import {NestedTreeControl} from '@angular/cdk/tree';
import {MatTreeNestedDataSource, MatTreeModule} from '@angular/material/tree';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { CitizenService } from './services/citizen.service';
import { CityService } from './services/city.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface FoodNode {
  name: string;
  children?: FoodNode[];
}

const TREE_DATA: FoodNode[] = [
  {
    name: 'Russua',
    children: [
      {
        name: 'Fruit',
        children: [{name: 'Apple'}, {name: 'Banana'}, {name: 'Fruit loops'}],
      },
      
  {
    name: 'Vegetables',
    children: [
      {
        name: 'Green',
        children: [{name: 'Broccoli'}, {name: 'Brussels sprouts'}],
      },
      {
        name: 'Orange',
        children: [{name: 'Pumpkins'}, {name: 'Carrots'}],
      },
    ],
  },
    ]
  },

  {
    name: 'Vegetables',
    children: [
      {
        name: 'Green',
        children: [{name: 'Broccoli'}, {name: 'Brussels sprouts'}],
      },
      {
        name: 'Orange',
        children: [{name: 'Pumpkins'}, {name: 'Carrots'}],
      },
    ],
  },
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatTreeModule, MatButtonModule, MatIconModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  treeControl = new NestedTreeControl<FoodNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<FoodNode>();

  constructor(
    private citiesService: CityService,
    private citizensService: CitizenService) {

    this.dataSource.data = TREE_DATA;

    this.citiesService.getAll().subscribe((val) => {
      console.log(val);
    })

    this.citizensService.getAll().subscribe((val) => {
      console.log(this.convertJsonFromServerToTreeComponentFormat(val));
    })
  }

  hasChild = (_: number, node: FoodNode) => !!node.children && node.children.length > 0;

  convertJsonFromServerToTreeComponentFormat(inputJson: any[]): any[] {
    const result: any[] = [];

    inputJson.forEach(person => {
      const city = person.groups.find((group: any) => group.type === 'city');
      const district = person.groups.find((group: any) => group.type === 'district');
      const street = person.groups.find((group: any) => group.type === 'street');

      let cityNode = result.find(node => node.name === city.name && node.type === 'city');

      if (!cityNode) {
        cityNode = {
          name: city.name,
          type: 'city',
          children: []
        }
        result.push(cityNode);
      };

      let districtNode = cityNode.children.find((node: any) => node.name === district.name && node.type === 'district');

      if (!districtNode) {
        districtNode = {
          name: district.name,
          type: 'district',
          children: []
        }
        cityNode.children.push(districtNode);
      }

      let streetNode = districtNode.children.find((node: any) => node.name === street.name && node.type === 'street');

      if (!streetNode) {
        streetNode = {
          name: street.name,
          type: 'street',
          children: []
        };
        districtNode.children.push(streetNode);
      }

      streetNode.children.push({ name: person.name });
    })

    return result;
  }
}
