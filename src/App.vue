<template xmlns:v-touch="http://www.w3.org/1999/xhtml">
  <div id="app" @click="resetActive()">
    <saved-boards :boards="boards" :active-board-index="activeBoardIndex"></saved-boards>
    <div class="board-content">
      <div class="main_menu">
        <span class="heading">Retrop</span>
        <div class="note_actions">
          <button id="red" class="red" @click.left="$refs.board.addNote('red')"
          @click.right="edit('red')"> {{color.red}}</button>
          <button id="blue" class="blue" @click="$refs.board.addNote('blue')"
                  @click.right="edit('blue')">{{color.blue}}</button>
          <button id="yellow" class="yellow" @click="$refs.board.addNote('yellow')"
                  @click.right="edit('yellow')">{{color.yellow}}</button>
          <button id="green" class="green" @click="$refs.board.addNote('green')"
                  @click.right="edit('green')">{{color.green}}</button>

          <button @click="$refs.board.reArrange()" title="Rearranges the notes by amount of votes and make them fit the current window">
            Re-arrange
          </button>
        </div>
        <div class="board_actions">
          <span class="subtle" :class="{'hidden':!unsavedChanges}">There are unsaved changes</span>
          <button v-on:click="saveBoards" :disabled="!unsavedChanges">Save</button>
          <button class="menu-toggle invert" @click.stop="toggleSidebar">🍔</button>
        </div>
      </div>

      <board ref="board" :board="activeBoard" v-if="activeBoard" />
    </div>
  </div>
</template>

<script>
import Board from './components/Board'
import SavedBoards from './components/SavedBoards'
import BoardExport from './boardexport'
import bus from './bus.js'
import moment from 'moment'
import Swal from 'sweetalert2';

export default {
  name: 'app',
  components: {
    Board,
    SavedBoards
  },
  data(){
    return {
      activeBoardIndex: 0,
      unsavedChanges: false,
      boards: [],
      color:{
        red: localStorage.getItem("red") || "Red",
        blue: localStorage.getItem("blue") || "Blue",
        yellow: localStorage.getItem("yellow") || "Yellow",
        green: localStorage.getItem("green") || "Green",
      },

    }
  },

  computed: {
    activeBoard () {
      return this.boards[this.activeBoardIndex] || false
    }
  },

  beforeMount () {
    var self = this

    bus.$on('remove-note', id => {
      var noteIndex = self.activeBoard.notes.findIndex( note => {
        return (id === note.id)
      })
      self.activeBoard.notes.splice(noteIndex, 1)
    })

    bus.$on('load-board', id => {
      self.activeBoardIndex = id
    })

    bus.$on('create-board', () => {
      self.boards.push(self.createBoard(false))
      self.activeBoardIndex = self.boards.length - 1
    })

    bus.$on('remove-board', id => {
      const last = self.boards.length - 1
      if (self.activeBoardIndex === last && id === last) {
        self.activeBoardIndex--
      }
      self.boards.splice(id, 1)
    })

    bus.$on('clear-board', () => {
      self.activeBoard.notes.splice(0, self.activeBoard.notes.length)
    })

    bus.$on('save-boards', () => {
      self.saveState()
    })
    bus.$on('export-board', () => {
      const board = new BoardExport(this.activeBoard)
      board.save()
    })
  },

  methods: {
    edit(type){
      Swal.fire({
        title: 'Change name of category',
        input: 'text',
        showCancelButton: true,
        confirmButtonClass: 'blue',
        cancelButtonClass: 'red',
        buttonsStyling: false,
        preConfirm: (name) => {
          if (name){
            localStorage.setItem(type,name)
            this.color[type] = name
          }
        }
      }).then((res)=>{
        if (res.value){
          Swal.fire({
            type: 'success',
            html: 'Changed',
            confirmButtonClass: 'btn blue',
            buttonsStyling: false
          })
        }
      })
    },
    longtapHandler(){
      console.log("long")
    },
    resetActive () {
      bus.$emit('reset-active')
    },

    boardTitle () {
      let today = moment().format('DD MMMM YYYY')
      return `My Discussion  for ${today}`
    },

    saveBoards () {
      bus.$emit('save-boards')
    },

    createBoard (initial) {
      var board = {
        title: this.boardTitle(),
        notes: [],
        initial: initial
      }
      return board
    },

    toggleSidebar () {
      bus.$emit('toggle-sidebar')
    },

    // Loads recent config from localstorage
    loadState () {
      var storage = window.localStorage

      // Check if there is saved content available
      if (storage.getItem('retrospective-version') !== VERSION) {
        this.migrateState()
      }

      var loadedContent = storage.getItem('retrospective-board')
      if (loadedContent) {
        this.boards = JSON.parse(loadedContent)
      }
    },

    // Saves current config to localstorage
    saveState () {
      var storage = window.localStorage
      var content = JSON.stringify(this.boards)
      storage.setItem('retrospective-board', content)
      this.unsavedChanges = false
    },

    migrateState () {
      var storage = window.localStorage

      var i = 0
      // Try to migrate data from older versions
      var oldState = storage.getItem('retrospective-board')

      // Data to migrate
      if (oldState) {
        var data = JSON.parse(oldState)
        data.forEach(board => {
          if (!board.notes) return
          board.notes.forEach(note => {
            // Check props for each note
            if (!note.id) {
              note.id = i
            }
            i++
          })
        })
        data = JSON.stringify(data)

        // Write updated item back to localStorage
        storage.setItem('retrospective-board', data)
      }

      // If migration succeeds, save version number in localStorage
      storage.setItem('retrospective-version', VERSION)
    }
  },

  watch: {
    'boards': {
      handler: function (newVal, oldVal) {
        // check if we're loading the app for the first time
        if (oldVal[0] && !oldVal[0].initial) {
          this.unsavedChanges = true
        }
      },
      deep: true // watch EVERYTHING
    },
  },

  created () {
    this.loadState()
    if (this.boards.length === 0) {
      this.boards.push(this.createBoard(true))
    }
  }
}
</script>

<style src="./assets/styles/common.scss" lang="scss"></style>
