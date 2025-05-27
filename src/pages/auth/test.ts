type Config = {
    url: string;
    enabled: boolean;
    events: string[];
    enabledForSecondary?: boolean;
};

const checkType = (objs: Config[]) => {

 const result =  objs.map(obj => {
        if (obj.enabledForSecondary){
            return [{
                url: obj.url,
                enabled: obj.enabled,
                events: obj.events,
                type: "PRIMARY"
            },
                {
                url: obj.url,
                enabled: obj.enabled,
                events: obj.events,
                type: "SECONDARY"
            }]
        }else {
            return {
                url: obj.url,
                enabled: obj.enabled,
                events: obj.events,
                type: "PRIMARY"
            }
        }
    })

    return result.flat();

};

const res = checkType([
    {
        url: "https://link1.com",
        enabled: true,
        events: ["event1", "event2"],
        enabledForSecondary: true
    },
    {
        url: "https://link2.com",
        enabled: false,
        events: ["event3"]
    }
])

console.log(res)