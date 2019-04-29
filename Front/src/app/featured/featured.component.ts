import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from "@angular/core";
import { WebView, LoadEventData } from "tns-core-modules/ui/web-view";
import { TextField } from "tns-core-modules/ui/text-field";
import { Label } from "tns-core-modules/ui/label";
import { isAndroid } from "tns-core-modules/platform";
import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";

@Component({
    selector: "Featured",
    moduleId: module.id,
    templateUrl: "./featured.component.html"
})
export class FeaturedComponent implements AfterViewInit  {

    // webViewSrc: string = "https://www.github.com";
    webViewSrc: string = "https://192.168.1.16:8443/";
    isItemVisible: boolean = true;
    enabled: boolean = false;
    touchResult = "Touch: x: _ y: _";
    panResult = "Pan: deltaX: _ deltaY: _";

    @ViewChild("myWebView") webViewRef: ElementRef;
    @ViewChild("urlField") urlFieldRef: ElementRef;
    @ViewChild("labelResult") labelResultRef: ElementRef;

    private firstUrl = "https://google.com/";
    private secondUrl = "https://docs.nativescript.org/";

    constructor() {
        // Use the component constructor to inject providers.
    }

    ngAfterViewInit() {
        const webview: WebView = this.webViewRef.nativeElement;
        const label: Label = this.labelResultRef.nativeElement;

        label.text = "WebView is still loading...";

        webview.on(WebView.loadFinishedEvent, (args: LoadEventData) => {
            let message;
            if (!args.error) {
                message = "WebView finished loading of " + args.url;
            } else {
                message = "Error loading " + args.url + ": " + args.error;
            }

            label.text = message;
            console.log("WebView message - " + message);
        });
    }

    goBack() {
        const webview: WebView = this.webViewRef.nativeElement;
        if (webview.canGoBack) {
            webview.goBack();
            this.enabled = true;
        }
    }
    goForward() {
        const webview: WebView = this.webViewRef.nativeElement;
        if (webview.canGoForward) {
            webview.goForward();
        } else {
            this.enabled = false;
        }
    }
    submit(args: string) {
        const textField: TextField = this.urlFieldRef.nativeElement;
        this.enabled = false;
        if (args.substring(0, 4) === "http") {
            this.webViewSrc = args;
            textField.dismissSoftInput();
        } else {
            alert("Please, add `http://` or `https://` in front of the URL string");
        }
    }

    /* Event */

    onLoadStarted(args: LoadEventData) {
        this.isItemVisible = true;
        let message: string;
        if (!args.error) {
            message = "WebView started loading of " + args.url;
        } else {
            message = "Error loading " + args.url + ": " + args.error;
        }
        console.log(message);
    }
    onLoadFinished(args: LoadEventData) {
        let message;
        if (!args.error) {
            message = "WebView finished loading of " + args.url;
        } else {
            message = "Error loading " + args.url + ": " + args.error;
        }
        console.log(message);
    }

    loadFirst() {
        this.webViewSrc = this.firstUrl;
    }

    loadSecond() {
        this.webViewSrc = this.secondUrl;
    }

    onReload() {
        const webview: WebView = <WebView>this.webViewRef.nativeElement;
        webview.reload();
    }

    /* Touch */
    onWebViewLoaded(webargs) {
        const webview = webargs.object;
        if (isAndroid) {
            webview.android.getSettings().setDisplayZoomControls(false);
        }
    }

    webViewTouch(args) {
        this.touchResult = `Touch: x: ${args.getX().toFixed(3)} y: ${args.getY().toFixed(3)}`;
        console.log(`Touch: x: ${args.getX().toFixed(3)} y: ${args.getY().toFixed(3)}`);
    }

    webViewPan(args) {
        this.panResult = `Pan: deltaX: ${args.deltaX.toFixed(3)} deltaY: ${args.deltaY.toFixed(3)}`;
        console.log(`Pan: deltaX: ${args.deltaX.toFixed(3)} deltaY: ${args.deltaY.toFixed(3)}`);
    }

    onDrawerButtonTap(): void {
        const sideDrawer = <RadSideDrawer>app.getRootView();
        sideDrawer.showDrawer();
    }
    
}
