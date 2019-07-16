class S3 {
  constructor(data, parent, source){
    this.data = data;
    this.id = data.id;
    this.parent = parent;
    this.source = source;
  }

  getS3Object(){
    // if(this.source !== null){
    //   return [
    //     {group: 'nodes', data: { id: this.id, parent:this.parent, label: "S3"}, classes: 's3'},
    //     { group: 'edges', data: { id: this.id+this.parent, source: this.source, target: this.id}}
    //   ]
    // }
    // else{
    //   return {group: 'nodes', data: { id: this.id, label: "S3"}, classes: 's3'}
    // }
    if(this.source !== null){
      return [
        {group: 'nodes', data: { parent:this.parent, label: "S3"}, classes: 'S3'},
        { group: 'edges', data: { source: this.source}}
      ]
    }
    else{
      return {group: 'nodes', data: {  parent:this.parent, label: "S3"}, classes: 'S3'}
    }
    
  }

}

export default S3;