<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
      <v-card color="blue" outlined tile>
        <v-card-title></v-card-title>
        <v-card-text>
          <todo-home></todo-home>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import TodoHome from '~/components/TodoHome.vue'

export default {
  components: {
    TodoHome,
  },
}
</script>
