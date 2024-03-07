

import { createApp } from "https://unpkg.com/vue@3/dist/vue.esm-browser.js";

const app = createApp({
  data: () => ({
    performers: [],
    main: [],
    lounge: []
  }),
  mounted(){
  },
  async created(){
    this.main = await this.fetchTimelineCSVData("./data/mainTimetable.csv");
    this.lounge = await this.fetchTimelineCSVData("./data/loungeTimetable.csv");
    this.performers = await this.fetchCSVData("./data/artist-info.csv");
    await this.getPerformerImage("./img/artist/");
    window.onload = function () {
      // この中に、ローディングが完全に終わった後の処理を書く
      console.log("ページのすべてのリソースが読み込まれました！");
    
      // 例: ローディング画面を非表示にする
      const loadingScreen = document.getElementById('loading');
      if (loadingScreen) {
        loadingScreen.style.display = 'none';
      }
    };
  },
  methods: {
    async fetchTimelineCSVData(url){
      const csv = await fetch(url)
      const text = await csv.text()
      const arr = this.parseTimelineCSV(text)
      return arr
    },
    async fetchCSVData(url) {
      // Fetch the CSV file
      const csv = await fetch(url)
      const text = await csv.text()
      const arr = this.parseCSV(text)
      return arr
    },
    parseTimelineCSV(csvData){
      const lines = csvData.split("\n");
      const timeline = [];
      // Assuming the CSV structure is: name,image,intro
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",");
        timeline.push({
          id: i + 1, // You can assign a unique id if needed
          time: `${cols[0]}`,
          name: `${cols[1]}`
        });
      }
      return timeline
    },
    parseCSV(csvData) {
      const lines = csvData.split("\n");
      const performers = [];
      // Assuming the CSV structure is: name,image,intro
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",");
        if(cols[0] == "") continue;
        performers.push({
          id: i + 1, // You can assign a unique id if needed
          name: cols[0],
          image: "",
          intro: `${cols[2]}`
        });
      }
      return performers;
    },
    async getPerformerImage(path){
      for (let performer of this.performers) {
        const index = performer.id - 2;
        const pathId = path + performer.id;  
        if (await this.imageExists(pathId + ".webp")) {
          this.performers[index].image = pathId + ".webp";
        } else if (await this.imageExists(pathId + ".gif")) {
          this.performers[index].image = pathId + ".gif";
        } else if (await this.imageExists(pathId + ".png")) {
          this.performers[index].image = pathId + ".png";
        } else if (await this.imageExists(pathId + ".jpg")) {
          this.performers[index].image = pathId + ".jpg";
        } else if (await this.imageExists(pathId + ".jpeg")) {
          this.performers[index].image = pathId + ".jpeg";
        } else {
          this.performers[index].image = path + "logo.png";
        }
      }
    },
    async imageExists(path) {
        const response = await fetch(path, { method: 'HEAD' });
        if (response.ok) {
          // Status code 200 - Path exists
          return true;
        } 
        return false;
    }
  },
});

app.mount("#app");
