var rem = 16; // 1rem的像素
var en_reaction = {
    "头孢曲松": ["Probenecid", "Warfarin"],
    "地塞米松": ["Diethylstilbestrol", "Diflunisal", "Dipyridamole", "Disopyramide",
        'Etoricoxib', 'Everolimus', 'Exenatide', 'Famciclovir', 'Felbamate',
        'Fentanyl', 'Fexofenadine', 'Fidaxomicin', 'Finasteride', 'Rotigotine',
        'Ruxolitinib', 'Salmeterol', 'Saquinavir', 'Saxagliptin', 'Selegiline',
        'Selexipag', 'Sertindole', 'Trazodone', 'Triazolam', 'Trifluoperazine', 'Tolterodine',
        'Toremifene', 'Tramadol', 'Trastuzumab emtansine', 'Trazodone', 'Triazolam',
        'Triflupromazine', 'Trimethadione', 'Trimethoprim', 'Trimipramine', 'Troglitazone',
        'Umeclidinium', 'Valdecoxib', 'Vandetanib', 'Vecuronium', 'Venetoclax',
        'Zalcitabine', 'Zaleplon', 'Zileuton', 'Ziprasidone', 'Zonisamide',
    ],
    "卡马西平": ['Cyclizine', 'Cyclobenzaprine', 'Cyclosporine', 'Cyproheptadine', 'Dabigatran etexilate',
        'Danazol', 'Dapiprazole', 'Dapsone', 'Darifenacin', 'Etizolam', 'Etodolac', 'Etoposide', 'Etoricoxib',
        'Etorphine', 'Everolimus', 'Famciclovir', 'Felbamate', 'Fencamfamine', 'Fentanyl', 'Lumacaftor',
        'Lumiracoxib', 'Lurasidone', 'Maprotiline', 'Maraviroc', 'Mebendazole', 'Medrysone', 'Megestrol acetate',
        'Melatonin', 'Meloxicam', 'Mephenytoin', 'Mepivacaine', 'Meprobamate', 'Oxprenolol', 'Oxymorphone', 'Palbociclib', 'Paliperidone', 'Palonosetron',
        'Quinidine', 'Rabeprazole', 'Raclopride', 'Raloxifene', 'Ranitidine', 'Tacrine', 'Tacrolimus', 'Tadalafil', 'Tamoxifen', 'Tamsulosin'
    ]
}

var get_tree_json = function() {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "data/static/tree.json", async = false);
    xhttp.send();
    return JSON.parse(xhttp.responseText);
}
var tree_json = get_tree_json();
var first_tumor = tree_json[0][0].id;

var get_json = function(tumor) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "data/static/" + tumor + ".json", async = false);
    xhttp.send();
    return JSON.parse(xhttp.responseText);
}

function load_ref() {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "data/static/ref.json", async = false);
    xhttp.send();
    return JSON.parse(xhttp.responseText);
}

function load_clinical_path(path) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "data/static/clinical_path_" + path.toString() + ".json", async = false);
    xhttp.send();
    return JSON.parse(xhttp.responseText);
}

var get_search_json = function() {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "data/static/search.json", async = false);
    xhttp.send();
    return JSON.parse(xhttp.responseText);
}

var set_nav_height = function() {
    $(".nav-bar").css("max-height", ($("#content").height() > window.innerHeight - 5 * rem) ? ($("#content").height() - 4 * rem) : (window.innerHeight - 9 * rem))
}

var set_none_style = function() {
    $("#content span").css({
        "font-style": "inherit",
        "color": "inherit",
    });
    $("span:contains('暂缺')").css({
        "font-style": "italic",
        "color": "#999999"
    });
}

var vt = new Vue({
    el: '#sidebar',
    data: {
        tree: tree_json,
        current_nav: 1,
    },
    methods: {
        change_content: function(tumor) {
            vm.js = get_json(tumor);
            this.$nextTick(() => {
                vm.change_card(1);
                vm.update_clinical_exist();
                vm.current_tumor = tumor;
                set_nav_height();
                set_none_style();
            })
        },
        change_tree: function(index) {
            this.current_nav = index;
            var path = "#tree" + index.toString() + " .el-menu-item.is-active";
            this.change_content($(path).attr("id").slice(0, -2));
        }
    }
})

var vm = new Vue({
    el: '#content',
    data: {
        js: get_json(first_tumor),
        ref: load_ref(),
        card_show: 1,
        current_tumor: first_tumor,
        clinical_path_exist: true,
        clinical_path_content: 0,
        en_reaction: en_reaction,
        subjectInfo: {},
        relations: [],
        color_list: ["", "bg-danger", "bg-warning", "bg-info", "bg-success"],
        current_drug: '',
        other_drug: '',
    },
    created: function() {
        this.update_clinical_exist();
    },
    methods: {
        change_card: function(index) {
            this.card_show = index;
            this.$nextTick(() => {
                set_nav_height();
            })
        },
        // 这个是点击卡片内的相似肿瘤时触发
        change_page: function(tumor) {
            tumor_id = tumor + '_2'
            vt.current_nav = 2; // 把导航栏换到第二个
            var submenuNode = document.getElementById(tumor_id).parentNode.parentNode.parentNode.previousSibling
            if (!submenuNode.parentNode.classList.contains("is-opened")) {
                submenuNode.click(); // 先展开子菜单
            }
            document.getElementById(tumor_id).click(); // 点击相应肿瘤
            setTimeout(function() {
                document.getElementById("tree2").scrollTop += ($("#" + tumor_id).offset().top - 9 * rem);
            }, 400);
        },
        update_clinical_exist: function() {
            var target = ["D32.", "C71.", "D43", "D16"]
            for (const key in target) {
                if (this.js.content.ICD_10Code[0].indexOf(target[key]) != -1) {
                    this.clinical_path_exist = true;
                    this.clinical_path_content = load_clinical_path(key);
                    return 0;
                }
            }
            this.clinical_path_exist = false;
        },
        // 点击卡片内的脑区时触发
        scroll: function(structure) {
            vt.current_nav = 3; // 把导航栏换到脑区
            if (!document.getElementById(structure).classList.contains("is-opened")) {
                document.getElementById(structure).firstChild.click(); // 展开子菜单
            }
            setTimeout(function() {

                document.getElementById("tree3").scrollTop += ($("#" + structure).offset().top - 9 * rem); // 滚动
            }, 300)
        },

        get_drug: function(id) {
            this.relations = [];
            this.subjectInfo = {};
            var xhr = new XMLHttpRequest();
            this.current_drug = id;
            xhr.open('GET', 'http://ihealth.whu.edu.cn:8080/get?drug=' + id, async = false);
            xhr.send();
            if (xhr.status === 200) {
                var result = JSON.parse(xhr.responseText);
                this.relations = result['relations'];
                this.subjectInfo = result['subjectInfo'];
            };
        },

        get_other_drug: function(id) {
            if (document.getElementById('drug-header').textContent.split(' ').indexOf(id) == -1) {
                this.other_drug = id
            }
            this.get_drug(id);
        }
    },
})

var se = new Vue({
    el: "#search",
    data: {
        search_json: get_search_json(),
        input: '',
        show_search_box: false,
        search_status: '',
        result: {},
    },
    watch: {
        input: function(newInput, oldInput) {
            if (this.input != '') {
                this.search_status = '查询中'
                this.debouncedGetResult();
                this.show_search_box = true;
            } else {
                this.show_search_box = false;
                result = {}
            }
        },
    },
    created: function() {
        this.debouncedGetResult = _.debounce(this.getResult, 500)
    },
    methods: {
        getResult: function() {
            if (this.input == '') {
                return
            }
            var inputLength = this.input.length;
            var tempResult = { 'name': [], 'enname': [], 'meshcode': [], 'icdcode': [] };
            for (var group in this.search_json) {
                for (var tumor in this.search_json[group]) {
                    var ind = this.search_json[group][tumor].toUpperCase().indexOf(this.input.toUpperCase());
                    if (ind != -1) {
                        tempResult[group].push([tumor, this.search_json[group][tumor], ind, ind + inputLength])
                    }
                }
            }
            var tempResult2 = {};
            if (tempResult['name'].length != 0) {
                tempResult2['中文名称'] = tempResult['name'].slice(0, 3);
            }
            if (tempResult['enname'].length != 0) {
                tempResult2['英文名称'] = tempResult['enname'].slice(0, 3);
            }
            if (tempResult['meshcode'].length != 0) {
                tempResult2['Mesh编码'] = tempResult['meshcode'].slice(0, 3);
            }
            if (tempResult['icdcode'].length != 0) {
                tempResult2['ICD-10编码'] = tempResult['icdcode'].slice(0, 3);
            }
            this.result = tempResult2;
            if (Object.keys(tempResult2).length == 0) {
                this.search_status = "无匹配项"
            }
        },
        jump_to: function(tumor_id) {
            vm.change_page(tumor_id);
            this.show_search_box = false;
        }
    }
})

$(document).ready(function() {
    set_nav_height();
    set_none_style();
    rem = parseFloat($("html").css('font-size'));
});

window.onresize = function() {
    set_nav_height();
}