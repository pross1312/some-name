import {ref, computed} from "vue";
import navbar from "./nav.js";
import home from "./home.js";
export default {
    data() {
        let current_content = ref("home");
        let current_key = ref("");
        history.pushState({page: 'home'}, 'PDict', '/');
        window.onpopstate = function(event) {
            if (event.state != null) {
                current_content.value = event.state.content || 'home';
                current_key.value = event.state.current_key;
            }
        }
        return {
            current_content,
            current_key,
        };
    },
provide() {
        return {
            change_content: (content) => {
                history.pushState({content, current_key: this.current_key}, 'PDict', '/');
                this.current_content = content;
            },
            set_key: computed(() => (k) => {this.current_key = k;}),
        }
    },
    components: {
        navbar, home
    },
    template: `
<navbar/>
<home/>
`
}