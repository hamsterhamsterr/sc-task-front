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

// interface FoodNode {
//   name: string;
//   children?: FoodNode[];
// }

interface CitizenNode {
  name: string;
  type: String
  children?: CitizenNode[];
}

// const TREE_DATA: FoodNode[] = [
//   {
//     name: 'Russua',
//     children: [
//       {
//         name: 'Fruit',
//         children: [{name: 'Apple'}, {name: 'Banana'}, {name: 'Fruit loops'}],
//       },
      
//   {
//     name: 'Vegetables',
//     children: [
//       {
//         name: 'Green',
//         children: [{name: 'Broccoli'}, {name: 'Brussels sprouts'}],
//       },
//       {
//         name: 'Orange',
//         children: [{name: 'Pumpkins'}, {name: 'Carrots'}],
//       },
//     ],
//   },
//     ]
//   },

//   {
//     name: 'Vegetables',
//     children: [
//       {
//         name: 'Green',
//         children: [{name: 'Broccoli'}, {name: 'Brussels sprouts'}],
//       },
//       {
//         name: 'Orange',
//         children: [{name: 'Pumpkins'}, {name: 'Carrots'}],
//       },
//     ],
//   },
// ];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatTreeModule, MatButtonModule, MatIconModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  treeControl = new NestedTreeControl<CitizenNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<CitizenNode>();

  constructor(
    private citiesService: CityService,
    private citizensService: CitizenService) {

    // this.dataSource.data = TREE_DATA;

    this.citiesService.getAll().subscribe((val) => {
      console.log(val);
    })

    this.citizensService.getAll().subscribe((val) => {
      // console.log(this.convertJsonFromServerToTreeComponentFormat(val));
      // this.dataSource.data = this.convertJsonFromServerToTreeComponentFormat(val);
      this.dataSource.data = this.convertJsonFromServerToTreeComponentFormatWithInclude(val, ['city', 'district', 'street']);
    })
  }

  hasChild = (_: number, node: CitizenNode) => !!node.children && node.children.length > 0;

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

  convertJsonFromServerToTreeComponentFormatWithInclude(inputJson: any[], includeGroupTypes: string[]): any[] {
    const result: any[] = [];
    // Текущии значения groups для жителя в виде {"city": {...}, "district": {...}, ...}
    const currentGroups: any = {};
    
    let previousGroup: any = null;

    inputJson.forEach(person => {
      // Find a value(object) of included group, like city, district, street in current person
      for (let groupName of includeGroupTypes) {
        currentGroups[groupName] = person.groups.find((group: any) => group.type === groupName);
      }

      for (let groupName of includeGroupTypes) {
        // Текущая группа, например "city": {...}
        let currentGroup = currentGroups[groupName];
        // Если это вершина иерархии
        let node = null;
        let isPreviousGroupExists = previousGroup ? true : false;

        if (!isPreviousGroupExists)
          node = result.find(node => node.name === currentGroup.name && node.type === groupName);
        else
          node = previousGroup.children.find((node: any) => node.name === currentGroup.name && node.type === groupName);

        if (!node) {
          node = {
            name: currentGroup.name,
            type: groupName,
            children: []
          }
          if (isPreviousGroupExists)
            previousGroup.children.push(node);
          else
            result.push(node);
        }

        // if last groupName add person
        if (groupName === includeGroupTypes[includeGroupTypes.length - 1])
          node.children.push({ name: person.name });

        previousGroup = node;
      }
      previousGroup = null;
    })
    console.log(result)
    return result;
  }
}
