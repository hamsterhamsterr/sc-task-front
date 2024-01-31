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

interface CitizenNode {
  name: string;
  type: String
  children?: CitizenNode[];
}

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

    this.citiesService.getAll().subscribe((val) => {
      console.log(val);
    })

    this.citizensService.getAll().subscribe((val) => {
      this.dataSource.data = this.convertJsonFromServerToTreeComponentFormat(val, ['city', 'district', 'street']);
    })
  }

  hasChild = (_: number, node: CitizenNode) => !!node.children && node.children.length > 0;

  convertJsonFromServerToTreeComponentFormat(inputJson: any[], includeGroupTypes: string[]): any[] {
    const result: any[] = [];
    // Текущии значения groups для жителя в виде {"city": {...}, "district": {...}, ...}
    const currentGroups: any = {};
    let previousGroup: any = null;

    inputJson.forEach(person => {
      // Find a value(object) of included group, like city, district, street in current person
      for (let groupName of includeGroupTypes) 
        currentGroups[groupName] = person.groups.find((group: any) => group.type === groupName);
      
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
    return result;
  }
}
