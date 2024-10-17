import React from "react"
import Sidebar from "./components/Sidebar"
import Editor from "./components/Editor"
import Split from "react-split"

// Firebase dependencies
import {
    onSnapshot,
    addDoc,
    doc,
    deleteDoc,
    setDoc
} from "firebase/firestore"
import { notesCollection, db } from "./firebase"

export default function App() {
    const [notes, setNotes] = React.useState([])
    const [currentNoteId, setCurrentNoteId] = React.useState("")
    // this is used to prevent too many interactions with the database
    // the temp node is filled up for 500ms and then a request is sent to the DB
    const [tempNoteText, setTempNoteText] = React.useState("")

    const sortedNotes = notes.sort((a, b) => b.updatedAt - a.updatedAt);

    const currentNote = notes.find(note => note.id === currentNoteId) || notes[0]

    //loads the notes from Firebase on app start up
    React.useEffect(() => {
        // unsubscribe is a callback clean up function returned by Firebase to
        // clear the connection to the DB
        const unsubscribe = onSnapshot(notesCollection, function (snapshot) {
            //gets the data from firebase and the id (separate from the document)
            const notesArr = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            }))
            setNotes(notesArr)
        })
        // unsubscribe is a funcion, so it will be called on app shut down
        return unsubscribe
    }, [])

    // this sets the temp text with the data from the currentNote body
    // the current note body is the one that has the text from the database
    // but the temp note text is the one that is actually being show in the editor
    React.useEffect(() => {
        if(currentNote) {
           setTempNoteText(currentNote.body)
        }
    }, [currentNote])

    // This block of code implements the debouncing logic that will wait for 500ms after the last
    // key stroke by the user. While the user is typing there will be no update to the DB, only 500ms 
    // after he stops. 
    React.useEffect(() => {
        // setTimeout returns a timeoutId used to clean up in case component re-renders
        const timeoutId = setTimeout(() => {
            // only update the note if the text actually changed
            // this prevents updating the note while selecting different notes
            if(currentNote.body !== tempNoteText){
                updateNote(tempNoteText)
            }
        }, 500)
        //useEffect allows us to clean up in case the component re-renders
        return () => {
            clearTimeout(timeoutId)
        }
    }, 
    // it depends on tempNoteText because everytime the user types something this value will change
    // and trigger the execution of this Effect, thus cancelling the previous timeout
    [tempNoteText])

    async function createNewNote() {
        const newNote = {
            body: "# Type your markdown note's title here",
            createdAt: Date.now(),
            updatedAt: Date.now()
        }
        //creates a note in Firebase
        const newNoteRef = await addDoc(notesCollection, newNote)
        setCurrentNoteId(newNoteRef.id)
    }

    async function updateNote(text) {
        //gets a reference to the note object with a specified id in this DB
        const noteRef = doc(db, "notes", currentNoteId)
        //overrides the object setting its body to the text
        await setDoc(
            noteRef,
            {
                body: text,
                updatedAt: Date.now()
            },
            {merge: true}
        )
    }

    async function deleteNote(event, noteId) {
        //gets a reference to the note object with a specified id in this DB
        const noteRef = doc(db, "notes", currentNoteId)
        //deletes note
        await deleteDoc(noteRef)
    }

    return (
        <main>
            {
                notes.length > 0
                    ?
                    <Split
                        sizes={[30, 70]}
                        direction="horizontal"
                        className="split"
                    >
                        <Sidebar
                            notes={sortedNotes}
                            currentNote={currentNote}
                            setCurrentNoteId={setCurrentNoteId}
                            newNote={createNewNote}
                            deleteNote={deleteNote}
                        />
                        <Editor
                            tempNoteText={tempNoteText}
                            setTempNoteText={setTempNoteText}
                        />
                    </Split>
                    :
                    <div className="no-notes">
                        <h1>You have no notes</h1>
                        <button
                            className="first-note"
                            onClick={createNewNote}>
                            Create one now
                        </button>
                    </div>
            }
        </main>
    )
}
