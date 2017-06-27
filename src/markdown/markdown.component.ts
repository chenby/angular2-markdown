import { Component, ElementRef, OnInit, AfterViewInit, Input } from '@angular/core';
import { Http } from '@angular/http';
import { MarkdownService } from './markdown.service';
import './prism.languages';

@Component({
    selector: 'markdown,[Markdown]',
    template: '<ng-content></ng-content>',
    styles: [
        `.token.operator, .token.entity, .token.url, .language-css .token.string, .style .token.string {
            background: none;
        }`
    ]
})
export class MarkdownComponent implements OnInit {
    private _path: string;
    private _data: string;
    private _md: any;
    private _ext: string;
    private _render: Function = function(){};//onrender默认为空
    changeLog: string[] = [];

    constructor(
        private mdService: MarkdownService,
        private el: ElementRef,
        private http: Http
    ) { }

    ngOnInit() {

    }

    @Input()
    set render(value:Function) {
       this._render = value; 
    }

    @Input()
    set path(value:string) {
      this._path = value;
      this.onPathChange();
    }

    @Input()
    set data(value:string) {
      this._data = value;
      this.onDataChange(value);
    }


    // on input
    onDataChange(data:string){
      this.el.nativeElement.innerHTML = this.mdService.compile(data);
      Prism.highlightAll(false);
      this._render(this.el.nativeElement);//onrender处理函数
    }

    /**
     *  After view init
     */
    ngAfterViewInit() {
      if(this._path) {
        this.onPathChange();
      } else {
        this.processRaw();
      }
    }

    processRaw() {
      this._md = this.prepare(this.el.nativeElement.innerHTML);
      this.el.nativeElement.innerHTML = this.mdService.compile(this._md);
      Prism.highlightAll(false);
      this._render(this.el.nativeElement);//onrender处理函数
    }

    /**
     * get remote conent;
     */
    onPathChange() {
        this._ext = this._path && this._path.split('.').splice(-1).join();
        this.mdService.getContent(this._path)
            .subscribe(data => {
                this._md = this._ext !== 'md' ? '```' + this._ext + '\n' + data + '\n```' : data;
                this.el.nativeElement.innerHTML = this.mdService.compile(this.prepare(this._md));
                Prism.highlightAll(false);
                this._render(this.el.nativeElement);//onrender处理函数
            },
            err => this.handleError);
    }

    /**
     * catch http error
     */
    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }

    /**
     * Prepare string
     */
     prepare(raw: string) {
        if (!raw) {
            return '';
        }

        return raw.replace(/\"/g, '\'');
    }

    /**
     * Trim left whitespace
     */
    private trimLeft(line: string) {
        return line.replace(/^\s+|\s+$/g, '');
    }
}
