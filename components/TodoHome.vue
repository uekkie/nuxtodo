<template>
  <v-card outlined tile>
    <v-card-title>Nuxtodo</v-card-title>

    <v-card-text>
      <v-form>
        <v-container>
          <div class="new-todo">
            <div class="new-todo-item">
              <v-text-field
                id="new-todo-title"
                v-model.trim="todoTitle"
                label="タイトル"
                single-line
                solo
                form="form-todo"
              ></v-text-field>
            </div>
            <div class="new-todo-item">
              <v-textarea
                id="new-todo-description"
                v-model.trim="todoDescription"
                solo
                name="input-7-4"
                label="説明"
                form="form-todo"
              ></v-textarea>
            </div>
            <div class="new-todo-category">
              <v-list dense>
                <v-subheader>カテゴリ</v-subheader>
                <v-list-item-group v-model="selectedItem" color="primary">
                  <v-list-item v-for="category in categories" :key="category">
                    <label for="'category-'+category">
                      <v-checkbox
                        :id="'category-' + category"
                        v-model="todoCategories"
                        :value="category"
                        form="form-todo"
                        :label="category"
                      />
                    </label>
                  </v-list-item>
                </v-list-item-group>
              </v-list>
              <form @submit.prevent="createCategory">
                <v-row>
                  <v-col>
                    <v-text-field
                      v-model.trim="categoryName"
                      label="新規カテゴリ"
                      single-line
                      solo
                    />
                  </v-col>
                  <v-col md="4">
                    <v-btn
                      elevation="2"
                      type="submit"
                      :disabled="!canCreateCategory"
                      >追加</v-btn
                    >
                  </v-col>
                </v-row>
              </form>
            </div>
            <div class="new-todo-action">
              <form id="form-todo" @submit.prevent="createTodo">
                <v-btn
                  elevation="2"
                  type="submit"
                  :disabled="!canCreateTodo"
                  color="primary"
                  >作成</v-btn
                >
              </form>
            </div>
          </div>
          <div class="todo-search">
            <div class="todo-search-item">
              <v-select
                :items="categories"
                label="カテゴリでフィルタ"
              ></v-select>
            </div>
            <div class="todo-search-item">
              <v-checkbox
                id="todo-search-done"
                v-model="hideDoneTodo"
                label="終了したものを非表示にする"
              />
            </div>
            <div class="todo-search-item">
              <v-select
                v-model="selectedOrder"
                :items="orders"
                item-text="label"
                item-value="value"
                label="並び順"
              >
              </v-select>
            </div>
            <div class="todo-search-item">
              <label for="todo-search-keyword">キーワードで検索</label>
              <v-input
                id="todo-search-keyword"
                v-model.trim="searchWord"
                type="text"
              />
            </div>
            <transition-group
              v-if="hasTodos"
              name="todo-list"
              tag="ul"
              class="todo-list"
            >
              <todo-item
                v-for="todo in todos"
                :key="todo.id"
                :done="todo.done"
                :todo="todo"
              >
              </todo-item>
            </transition-group>
            <p v-else>ToDoタスクはまだ登録されていません</p>
          </div>
        </v-container>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script>
import firebase from '@/plugins/firebase'

export default {
  data() {
    return {
      todoTitle: '',
      todoDescription: '',
      searchWord: '',
      todoCategories: [],
      selectCategory: '',
      todos: [],
      categories: [],
      hideDoneTodo: false,
      selectedOrder: 'desc',
      categoryName: '',
      orders: [
        { label: '降順', value: 'desc' },
        { label: '昇順', value: 'asc' },
      ],
    }
  },
  computed: {
    canCreateTodo() {
      return this.todoTitle !== ''
    },
    canCreateCategory() {
      return this.categoryName !== '' && !this.existsCategory
    },
    existsCategory() {
      const categoryName = this.categoryName
      return this.categories.includes(categoryName)
    },
    hasTodos() {
      return this.todos.length > 0
    },
    resultTodos() {
      const selectedCategory = this.selectCategory
      const hideDoneTodo = this.hideDoneTodo
      const order = this.order
      const searchWord = this.searchWord
      return this.todos
        .filter(function (todo) {
          return (
            selectedCategory === '' ||
            todo.categories.includes(selectedCategory)
          )
        })
        .filter(function (todo) {
          if (hideDoneTodo) {
            return !todo.done
          }
          return true
        })
        .filter(function (todo) {
          return (
            todo.title.includes(searchWord) ||
            todo.description.includes(searchWord)
          )
        })
        .sort(function (a, b) {
          if (order === 'asc') {
            return a.dateTime - b.dateTime
          }
          return b.dateTime - a.dateTime
        })
    },
  },
  created() {
    firebase
      .database()
      .ref('todos')
      .on('child_added', (snapshot) =>
        this.todos.push({ ...snapshot.val(), id: snapshot.key })
      )

    firebase
      .database()
      .ref('categories')
      .on('child_added', (snapshot) =>
        this.categories.push({ ...snapshot.val(), id: snapshot.key })
      )
    const vue = this

    firebase
      .database()
      .ref('todos')
      .on('value', function (snapshot) {
        if (snapshot) {
          const rootList = snapshot.val()
          const list = []
          // データオブジェクトを配列に変更する
          if (rootList != null) {
            Object.keys(rootList).forEach((val) => {
              rootList[val].id = val
              list.push(rootList[val])
            })
            vue.todos = list
          }
        }
      })

    firebase
      .database()
      .ref('categories')
      .on('value', function (snapshot) {
        if (snapshot) {
          const rootList = snapshot.val()
          const list = []
          // データオブジェクトを配列に変更する
          if (rootList != null) {
            Object.keys(rootList).forEach((val) => {
              list.push(rootList[val])
            })
            vue.categories = list
          }
        }
      })
  },
  methods: {
    createTodo() {
      if (!this.canCreateTodo) {
        return
      }
      firebase
        .database()
        .ref('todos')
        .push({
          id: 'todo-' + Date.now(),
          title: this.todoTitle,
          description: this.todoDescription,
          categories: this.todoCategories,
          dateTime: Date.now(),
          done: false,
        })

      this.todoTitle = ''
      this.todoDescription = ''
      this.todoCategories = []
    },
    createCategory() {
      if (!this.canCreateCategory) {
        return
      }

      // カテゴリを追加する
      firebase.database().ref('categories').push(this.categoryName)

      this.categoryName = ''
    },
  },
}
</script>

<style></style>
