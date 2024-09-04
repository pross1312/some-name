import {ref} from "vue";
export default {
    inject: ["set_key", "change_content"],
    setup(props) {
        let keywords = ref([]);
        let to_be_removed = "";
        const element_width = 190;
        const per_row = Math.max((window.innerWidth/element_width) >> 0, 2);
        console.log(window.innerWidth, per_row);
        let has_data = ref(false);
        let all_groups = ref([]);
        let current_group = ref("");
        fetch(`http://${window.location.host}/list`).then(async result => {
            if (result.headers.get("Content-Type").match("application/json") != null) {
                let items = await result.json();
                keywords.value.push(...items);
                has_data.value = true;
            }
        }).catch(err => alert(err));
        fetch(`http://${window.location.host}/list-group`).then(async result => {
            if (result.headers.get("Content-Type").match("application/json") != null) {
                all_groups.value = (await result.json()).Group;
            }
        }).catch(err => alert(err));
        return {has_data, keywords, per_row, all_groups, current_group, to_be_removed, element_width};
    },
    methods: {
        cancel_remove_key() {
            document.getElementById("confirm-container").classList.add("d-none");
        },
        confirm_remove_key() {
            let key = this.to_be_removed.trim();
            fetch(`http://${window.location.host}/list`, {
                method: "DELETE",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify([key]),
            }).then(result => {
                console.log(result.statusText);
                let index = this.keywords.indexOf(key);
                if (index != -1) this.keywords.splice(index, 1);
                document.getElementById("confirm-container").classList.add("d-none");
            }).catch(err => {
                alert(err);
            });
        },
        remove_key(key) {
            this.to_be_removed = key;
            document.getElementById("confirm-container").classList.remove("d-none");
        },
        select_group(group) {
            this.has_data = false;
            this.keywords = [];
            fetch(`http://${window.location.host}/list?group=${group}`).then(async result => {
                if (result.headers.get("Content-Type").match("application/json") != null) {
                    let items = await result.json();
                    this.keywords.push(...items);
                    this.current_group = group
                    this.has_data = true;
                }
            }).catch(err => {alert(err);});
        },
    },
    template: `
<div id="confirm-container" class="d-none h-100 w-100 position-absolute d-flex flex-column justify-content-center"
     style="background-color: #101010bb; z-index: 1000;">
     <div class="d-inline-block m-auto bg-body-secondary rounded pt-2 pb-2 p-4"
          style="width: fit-content; height: fit-content;">
         <span class="d-block text-center" style="color: red;">Confirm delete?</span>
         <span class="d-block mt-2">
             <button class="me-2 btn btn-sm btn-primary" @click="confirm_remove_key()">Confirm</button>
             <button class="ms-2 btn btn-sm btn-secondary" @click="cancel_remove_key()">Cancel</button>
         </span>
     </div>
</div>
<div v-if="has_data" class="m-0 p-0 border-0" style="height: 100%; width: 100%; overflow-y: hidden !important">
<div class="position-absolute z-1 ps-1 pe-1">
    <span>Group:</span>
    <div v-bind:class="current_group.trim() === '' ? '' : 'ms-2'"  class="btn-group btn-group-sm border-0 border rounded-2">
        <span class="fs-6">{{current_group}}</span>
        <button type="button" class="m-auto ms-2 btn fs-6 pt-0 pb-0 p-0 border-0 dropdown-toggle dropdown-toggle-split"
                style="width: fit-content; height: fit-content;"
                data-bs-toggle="dropdown">
        </button>
        <span class="visually-hidden">Toggle Dropdown</span>
        <ul class="dropdown-menu overflow-auto" style="height: 300px">
            <li>
                <p style="cursor: pointer; color: yellow"
                   @mousedown.left="select_group('')"
                   class="dropdown-item m-0 fs-6 pt-0 pb-0">-ALL-</p>
            </li>
            <li v-for="group in all_groups">
                <p style="cursor: pointer;"
                   @mousedown.left="select_group($event.currentTarget.innerText)"
                   class="dropdown-item m-0 fs-6 pt-0 pb-0">{{group}}</p>
            </li>
        </ul>
    </div>
</div>
<div class="container-fluid" style="height: 100%; margin-top: 1em; padding-bottom: 5em; overflow-x: hidden !important">
    <div v-for="(_, row) in Number((keywords.length/per_row) >> 0) + 1"
         class="row d-flex flex gx-5 mt-3">
        <div v-for="(_, col) in per_row" :class="['col-' + ((12/per_row)>>0)]"
             class="d-flex col">
            <span v-if="row*per_row + Number(col) < keywords.length" class="h-100 d-flex flex-grow-1">
                <span class="d-flex flex-column h-100 justify-content-center bg-body-secondary"
                      style="width: fit-content;">
                    <button class="btn-close d-inline"
                            @mousedown.left="remove_key(keywords[row*per_row  + Number(col)])"></button>
                </span>
                <button class="pt-1 pb-1 btn btn-sm btn-secondary rounded-0 text-wrap"
                        @mousedown.left="set_key(keywords[row*per_row + Number(col)]); change_content('home')">
                    {{keywords[row*per_row + Number(col)]}}
                </button>
            </span>
        </div>
    </div>
</div>
</div>
`
}
