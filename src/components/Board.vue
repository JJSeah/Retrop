<template>
  <div class="board" >
    <p>
      <input class="board-title" v-model="board.title" />
    </p>
    <div class="notes">
      <div class="empty-state" v-show="!board.notes.length">Get started 🤖 </div>
      <note v-for="note in board.notes" :key="note.id" :content="note.text"
        :type="note.note_type" :position="note.position" :id="note.id" :note-size="note.noteSize"
        :font-size="note.fontSize" :votes="note.votes" :order="note.order" :active="note.id == activeDrag"
        @update="updateNote" @stop-drag="stopDrag" @start-drag="startDrag">
        </note>
    </div>
  </div>
</template>

<script>
import Note from './Note'
import Positioner from '../positioner'
import bus from '../bus.js'
import Swal from 'sweetalert2';

export default {
  props: {
    board: {
      type: Object,
      required: true
    }
  },

  data: () => ({
    activeDrag: null
  }),

  beforeMount () {
    this.positioner = new Positioner()
    bus.$on('reset-active', () => {
      this.activeDrag = null
    })
  },

  watch: {
    'board.notes': function (notes) {
      this.positioner.setGrid(notes)
    }
  },

  methods: {
    startDrag (id) {
      var maxOrder = this.getMaxOrder()
      var note = this.getNoteById(id)

      // Set as active
      this.activeDrag = id

      // This note already is the top one, dont add 1
      if (note.order === maxOrder && maxOrder > 0) {
        return
      } else {
        this.updateNote(id, {order: maxOrder + 1})
      }
    },
    stopDrag (id) {
      this.updateNote(id, {active: false})
    },

    getNoteById (id) {
      return this.board.notes.find(function (note) {
        return id === note.id
      })
    },

    updateNote (id, update) {
      var note = this.getNoteById(id)
      if (note) {
        // The whole board is not "initial" anymore
        if (this.board.initial) { delete this.board.initial }

        // Update note properties
        Object.assign(note, update)
      } else {
        throw new Error('Where\'s the note!?')
      }
      return note
    },

    getMaxOrder () {
      return this.board.notes.reduce(function (prev, value) {
        if (typeof value.order === 'undefined') { return prev }
        return (prev > value.order ? prev : value.order)
      }, 0)
    },

    addNote (type) {
      var placeholderText
      var terciary
      switch (type) {
        case 'green':
          placeholderText = 'Team Green'
          terciary = 2.25
          break
        case 'yellow':
          placeholderText = 'Team Yellow'
          terciary = 1.5
          break
        case 'blue':
          placeholderText = 'Team Blue'
          terciary = 0.75
          break
        case 'red':
          placeholderText = 'Team Red'
          terciary = 0
          break
      }

      Swal.fire({
        input: 'textarea',
        title: 'Idea',
        showCancelButton: true,
        confirmButtonClass: 'blue',
        cancelButtonClass: 'red',
        buttonsStyling: false,
      })
        .then((res)=>{
          if (res.value){
            // Note default props
            var note = {
              text: res.value,
              note_type: type,
              position: this.positioner.getPositionforNew(terciary),
              noteSize: {w: 200, h: 150},
              fontSize: 1,
              votes: 0,
              order: this.getMaxOrder() + 1,
              id: Math.round(Math.random() * 100000)
            }
            this.board.notes.push(note)
            Swal.fire({
              type: 'success',
              html: 'Posted',
              confirmButtonClass: 'btn btn-success btn-fill',
              buttonsStyling: false
            });
          }
        })

    },

    reArrange () {
      this.positioner.setState(this.board.notes)
      this.positioner.reArrange()
    },
  },

  components: {
    Note
  }
}
</script>
