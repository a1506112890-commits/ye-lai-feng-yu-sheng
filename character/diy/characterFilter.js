import { lib, game, ui, get, ai, _status } from "../../noname.js";

const characterFilters = {

    ns_duangui(mode){
        return mode === "identity" && _status.mode === "normal";
    },

    xiaodu_sihengtuo(mode){
        return false;
    },

};

export default characterFilters;