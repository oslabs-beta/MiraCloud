class Lambda {
    constructor(data, parent){
        this.id = data.FunctionName;
        this.parent = parent;
        this.data = data;
    }

    getLambdaObject(){
        if(this.data['TracingConfig']['Mode']==='Active') return {group: 'nodes', data: { id: this.id, parent:this.parent,label: "Lambda: "+this.id}, classes: 'Lambda Active'}
        else return {group: 'nodes', data: { id: this.id, parent:this.parent,label: "Lambda: "+this.id}, classes: 'Lambda Passthrough'}
    }
}

export default Lambda;
