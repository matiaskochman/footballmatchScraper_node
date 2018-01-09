# footballmatchScraper_node
                tag.children[0].children.map(function(d02,i02){
                  if(d02 && d02.attribs && d02.attribs.class && d02.attribs.class.includes('match') ){

                    if(d02.children[1] && d02.children[1].attribs.class && d02.children[1].attribs.class.includes('team__name')){
                      console.log('match')
                      let data = d02.children[1].children[0].children[0].data;
                      console.log('data:',data);
                    }


                  }
                })
