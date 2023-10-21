import Model from './model.js';

export default class CollectionFilter extends Model {
    constructor(data, params, model) {
        super();
        this.data = data;
        this.params = params;
        this.model = model;
    }
    get() {
        let filteredResults;
        if (typeof this.params === 'object' && this.params !== null) {
            filteredResults = this.data;
    
            for (const key in this.params) {
                const value = this.params[key];
    
                if (key === 'Name' || key === "Category" || key === "Url") {
                    filteredResults = this.Filter(value, key, filteredResults);
                }
                else if (key === "sort") {
                    filteredResults = this.Sort(value, filteredResults);
                }
                else if (key === "limit") {
                    const limit = value;
                    const offset = this.params.offset;

                    filteredResults = this.Limit(limit, offset, filteredResults);
                }
                else if (key === "field") {
                    filteredResults = this.Field(value, filteredResults);
                }
                else if (key === 'fields') {
                    const fields = value.split(',');
                    const filteredResultsArray = [];
                    for (const field of fields) {
                        const fieldResults = this.Field(field, filteredResults);
                        filteredResultsArray.push(fieldResults);
                    }
                    filteredResults = [].concat(...filteredResultsArray);
                }
            }
        }
        return filteredResults;
    }
    Limit(limit, offset, filteredData) {
        limit = parseInt(limit);
        offset = parseInt(offset);
        const startIndex = (offset - 1) * limit;
        const endIndex = startIndex + limit;
    
        const itemsInBlock = filteredData.slice(startIndex, endIndex);
    
        return itemsInBlock;
    }
    Field(value){
        if(value === "Category"){
            return this.getAllCategories();
        }
        else if(value === "Name"){
            return this.getAllNames();
        }
        else if(value === "Url"){
            return this.getAllUrls();
        }
        else if(value === "Id"){
            return this.getAllIds();
        }
    }
    Sort(value, objectsList) {
        let [field, direction] = value.split(',');
        
        if (field === "Name") field = "Title";

        if (field && objectsList) {
            objectsList.sort((a, b) => {
                if (direction === 'desc') {
                    return this.innerCompare(b[field], a[field]);
                } else {
                    return this.innerCompare(a[field], b[field]);
                }
            });
        }
    
        return objectsList;
    }
    Filter(value, key){
        if (value.includes('*')){
            if(value.startsWith('*') && value.endsWith('*')){
                const input = value.replace(/\*/g, '');
                return this.SearchBookmarkAnywhere(input, key);
                //do the *ab* query
            }
            else if(value.endsWith('*')){
                const input = value.replace('*', '');
                return this.SearchBookmarkEnd(input, key);
                //do the ab* query
            }
            else if(value.startsWith('*')){
                const input = value.replace('*', '');
                return this.SearchBookmarkStart(input, key);
                //do the *ab query
            }
            else {
                throw new Error("Invalid query format!!!");
            }
        }
        else {
            return this.SearchBookmark(value, key);
        }
    }
    getAllCategories() {
        const categoriesSet = new Set();
    
        this.data.forEach(item => {
            if (item.Category) {
                categoriesSet.add(item.Category);
            }
        });
        const uniqueCategories = [...categoriesSet];
    
        return uniqueCategories;
    }
    getAllNames() {
        const namesSet = new Set();
    
        this.data.forEach(item => {
            if (item.Title) {
                namesSet.add(item.Title);
            }
        });
        const uniqueNames = [...namesSet];
    
        return uniqueNames;
    }
    getAllUrls() {
        const urlsSet = new Set();
    
        this.data.forEach(item => {
            if (item.Url) {
                urlsSet.add(item.Url);
            }
        });
        const uniqueUrls = [...urlsSet];
    
        return uniqueUrls;
    }
    getAllIds() {
        const idsSet = new Set();
    
        this.data.forEach(item => {
            if (item.Id) {
                idsSet.add(item.Id);
            }
        });
        const uniqueIds = [...idsSet];
    
        return uniqueIds;
    }
    SearchBookmarkAnywhere(input, key){
        const filteredData = this.data.filter(item => {
            switch(key){
                case "Name":
                    return item.Title && item.Title.toLowerCase().includes(input.toLowerCase());
                    break;
                case "Category":
                    return item.Category && item.Category.toLowerCase().includes(input.toLowerCase());  
                    break;
                case "Url":
                    return item.Url && item.Url.toLowerCase().includes(input.toLowerCase());  
                    break;
                case "Id":
                    return item.Id && item.Id.toLowerCase().includes(input.toLowerCase());
                    break;
            }
        });
        return filteredData;
    }
    SearchBookmark(input, key){
        const filteredData = this.data.filter(item => {
            switch(key){
                case "Name":
                    return item.Title && item.Title.toLowerCase() === input.toLowerCase();   
                    break;
                case "Category":
                    return item.Category && item.Category.toLowerCase() === input.toLowerCase();    
                    break;
                case "Url":
                    return item.Url && item.Url.toLowerCase() === input.toLowerCase();   
                    break;
                case "Id":
                    return item.Id && item.Id.toLowerCase() === input.toLowerCase();  
                    break;
            }
        });
        return filteredData;
    }
    SearchBookmarkEnd(input, key) {
        const filteredData = this.data.filter(item => {
            switch(key){
                case "Name":
                    return item.Title && item.Title.toLowerCase().endsWith(input.toLowerCase());    
                    break;
                case "Category":
                    return item.Category && item.Category.toLowerCase().endsWith(input.toLowerCase());    
                    break;
                case "Url":
                    return item.Url && item.Url.toLowerCase().endsWith(input.toLowerCase());    
                    break;
                case "Id":
                    return item.Id && item.Id.toLowerCase().endsWith(input.toLowerCase());    
                    break;
            }
        });
        return filteredData;
    }
    SearchBookmarkStart(input, key){
        const filteredData = this.data.filter(item => {
            switch(key){
                case "Name":
                    return item.Title && item.Title.toLowerCase().startsWith(input.toLowerCase());    
                    break;
                case "Category":
                    return item.Category && item.Category.toLowerCase().startsWith(input.toLowerCase());    
                    break;
                case "Url":
                    return item.Url && item.Url.toLowerCase().startsWith(input.toLowerCase());    
                    break;
                case "Id":
                    return item.Id && item.Id.toLowerCase().startsWith(input.toLowerCase());    
                    break;
            }
            
        });
        return filteredData;
    }
    valueMatch(value, searchValue) {
        try {
        let exp = '^' + searchValue.toLowerCase().replace(/\*/g, '.*') + '$';
        return new RegExp(exp).test(value.toString().toLowerCase());
        } catch (error) {
        console.log(error);
        return false;
        }
        }
    compareNum(x, y) {
        if (x === y) return 0;
        else if (x < y) return -1;
        return 1;
    }
    innerCompare(x, y) {
        if ((typeof x) === 'string')
            return x.localeCompare(y);
        else
            return this.compareNum(x, y);
    }
}