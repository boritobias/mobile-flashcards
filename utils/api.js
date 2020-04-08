import { AsyncStorage } from 'react-native'
import { Notifications } from 'expo'
import * as Permissions from 'expo-permissions'

export const FLASHCARD_STORAGE_KEY = 'MobileFlashCards:decklist'
const NOTIFICATION_KEY = 'MobileFlashCards:notifications'

export function getDecks() {
  return AsyncStorage.getItem(FLASHCARD_STORAGE_KEY)
    .then((res) => {
      // console.log('Parsed decks result: ', JSON.parse(res))
      return JSON.parse(res)
    })
}

export function getDeck(id) {
  return AsyncStorage.getItem(FLASHCARD_STORAGE_KEY)
    .then((decks) => {
      const data = JSON.parse(decks)
      return data[id]
    })
}

export function saveDeckTitle(deckTitle) {
  const deck = {
    [deckTitle]: {
      title: deckTitle,
      questions: []
    }
  }
  return AsyncStorage.mergeItem(FLASHCARD_STORAGE_KEY, JSON.stringify(deck))
    .then((res) => {
      return res
    })

}

export function addCardToDeck(deckTitle, question, answer) {
  return AsyncStorage.getItem(FLASHCARD_STORAGE_KEY)
    .then((decks) => {
      const data = JSON.parse(decks)
      const deck = {
        [deckTitle]: {
          title: deckTitle,
          questions: [
            ...data[deckTitle].questions,
            {
              question: question,
              answer: answer,
            }
          ]
        }
      }
      return AsyncStorage.mergeItem(FLASHCARD_STORAGE_KEY, JSON.stringify(deck))
        .then((res) => {
          return res
        })
    })
}

export function clearLocalNotification() {
  return AsyncStorage.removeItem(NOTIFICATION_KEY)
    .then(Notifications.cancelAllScheduledNotificationsAsync)
}

function createNotification() {
  return {
    title: 'Take a quiz',
    body: "👋 Don't forget to take a quiz today!",
    ios: {
      sound: true,
    },
    android: {
      sound: true,
      priority: 'high',
      sticky: false,
      vibrate: true,
    }
  }
}

export function setLocalNotification() {
  AsyncStorage.getItem(NOTIFICATION_KEY)
    .then(JSON.parse)
    .then((data) => {
      console.log(data)
      if (data === null) {
        Permissions.askAsync(Permissions.NOTIFICATIONS)
          .then(({ status }) => {
            if (status === 'granted') {
              Notifications.cancelAllScheduledNotificationsAsync()

              let tomorrow = new Date()
              tomorrow.setDate(tomorrow.getDate() + 1)
              tomorrow.setHours(10)
              tomorrow.setMinutes(33)

              Notifications.scheduleLocalNotificationAsync(
                createNotification(),
                {
                  time: tomorrow,
                  repeat: 'day',
                }
              )

              AsyncStorage.setItem(NOTIFICATION_KEY, JSON.stringify(true))
            }
          })
      }
    })
}