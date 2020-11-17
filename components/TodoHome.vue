<template>
  <div>
    <div class="new-todo">
      <div class="new-todo-item">
        <label for="new-todo-title">タイトル</label>
        <input
          id="new-todo-title"
          v-model.trim="todoTitle"
          type="text"
          form="form-todo"
        />
      </div>
      <div class="new-todo-item">
        <label for="new-todo-description">説明</label>
        <textarea
          id="new-todo-description"
          v-model.trim="todoDescription"
          form="form-todo"
        ></textarea>
      </div>
      <div class="new-todo-category">
        カテゴリ
        <ul>
          <li v-for="category in categories" :key="category">
            <label for="'category-'+category">
              <input
                :id="'category-' + category"
                v-model="todoCategories"
                type="checkbox"
                :value="category"
                form="form-todo"
              />
              {{ category }}
            </label>
          </li>
        </ul>
        <form @submit.prevent="createCategory">
          <input v-model.trim="categoryName" type="text" />
          <button type="submit" :disabled="!canCreateCategory">作成</button>
        </form>
      </div>
      <div class="new-todo-action">
        <form id="form-todo" @submit.prevent="createTodo">
          <button type="submit" :disabled="!canCreateTodo">作成</button>
        </form>
      </div>
    </div>
    <div class="todo-search">
      <div class="todo-search-item">
        <label for="todo-search-category">カテゴリでフィルタ</label>
        <select id="todo-search-categry" v-model="selectCategory">
          <option value="">指定なし</option>
          <option
            v-for="category in categories"
            :key="category"
            :value="category"
          >
            {{ category }}
          </option>
        </select>
      </div>
      <div class="todo-search-item">
        <label for="todo-search-done"
          >終了したものを非表示にする
          <input id="todo-search-done" v-model="hideDoneTodo" type="checkbox" />
        </label>
      </div>
      <div class="todo-search-item">
        <select v-model="order">
          <option value="desc">降順</option>
          <option value="asc">昇順</option>
        </select>
      </div>
      <div class="todo-search-item">
        <label for="todo-search-keyword">キーワードで検索</label>
        <input id="todo-search-keyword" v-model.trim="searchWord" type="text" />
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
  </div>
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
      order: 'desc',
      categoryName: '',
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
      console.log('=======]' + this.todos)
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
        vue.categories = snapshot.val()
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
