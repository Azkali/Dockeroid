import { Component } from "@angular/core";
import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { alert } from "tns-core-modules/ui/dialogs";
import { SelectedIndexChangedEventData } from "tns-core-modules/ui/tab-view";
import { ScrollEventData, ScrollView } from "tns-core-modules/ui/scroll-view";
import { ObservableArray, ChangedData } from "tns-core-modules/data/observable-array";
import { ITodo } from "../models/todo";

@Component({
    selector: "Home",
    moduleId: module.id,
    templateUrl: "./home.component.html"
})
export class HomeComponent {
    public mockedDataArray = require("../mocks/data");
    public tabSelectedIndex: number;
    public tabSelectedIndexResult: string;
    public countries: ObservableArray<ITodo>;

    constructor() {
        this.tabSelectedIndexResult = "Profile Tab (tabSelectedIndex = 0 )";
        this.countries = new ObservableArray(this.mockedDataArray);
        console.log(this.countries);
    }
    onDrawerButtonTap(): void {
        const sideDrawer = <RadSideDrawer>app.getRootView();
        sideDrawer.showDrawer();
    }
    // displaying the old and new TabView selectedIndex
    onSelectedIndexChanged(args: SelectedIndexChangedEventData) {
        if (args.oldIndex !== -1) {
            const newIndex = args.newIndex;
            if (newIndex === 0) {
                this.tabSelectedIndexResult = "Profile Tab (tabSelectedIndex = 0 )";
            } else if (newIndex === 1) {
                this.tabSelectedIndexResult = "Stats Tab (tabSelectedIndex = 1 )";
            } else if (newIndex === 2) {
                this.tabSelectedIndexResult = "Settings Tab (tabSelectedIndex = 2 )";
            }
        }
    }

    onScroll(args: ScrollEventData) {
        console.log("scrollX: " + args.scrollX + "; scrollY: " + args.scrollY);
    }

    onScrollLoaded(args) {
        // scroll to specific position of the horizontal scroll list
        let scrollOffset = 330;
        (<ScrollView>args.object).scrollToVerticalOffset(scrollOffset, true);
    }

}
