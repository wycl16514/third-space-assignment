import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Button, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

export default function HomeScreen() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [schedule, setSchedule] = useState('daily');
  const [currency, setCurrency] = useState(0);
  const [storyModalVisible, setStoryModalVisible] = useState(false);
  const [situation, setSituation] = useState('');
  const [userChoice, setUserChoice] = useState('');
  const [aiResponse, setAiResponse] = useState('');

  useEffect(() => {
    fetchTasks();
    fetchCurrency();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_BASE}/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCurrency = async () => {
    try {
      const response = await axios.get(`${API_BASE}/currency`);
      setCurrency(response.data.currency);
    } catch (error) {
      console.error(error);
    }
  };

  const addTask = async () => {
    if (newTask.trim()) {
      try {
        await axios.post(`${API_BASE}/tasks`, {
          title: newTask,
          schedule: schedule
        });
        setNewTask('');
        fetchTasks();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const completeTask = async (taskId) => {
    try {
      await axios.put(`${API_BASE}/tasks/${taskId}/complete`);
      fetchTasks();
      fetchCurrency();
    } catch (error) {
      console.error(error);
    }
  };

  const unlockStory = async () => {
    try {
      const response = await axios.post(`${API_BASE}/unlock-story`);
      setSituation(response.data.situation);
      setStoryModalVisible(true);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to unlock story');
    }
  };

  const submitChoice = async () => {
    try {
      const response = await axios.post(`${API_BASE}/respond-to-choice`, {
        choice: userChoice
      });
      setAiResponse(response.data.response);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.currency}>Currency: {currency}</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="New task"
          value={newTask}
          onChangeText={setNewTask}
        />
        <Button title="Add Task" onPress={addTask} />
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <TouchableOpacity onPress={() => completeTask(item.id)}>
              <Text style={item.completed ? styles.completedTask : styles.taskText}>
                {item.title} ({item.schedule})
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Button title="Unlock Story" onPress={unlockStory} disabled={currency < 50} />

      <Modal visible={storyModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.situationText}>{situation}</Text>
          <TextInput
            style={styles.choiceInput}
            placeholder="Your choice"
            value={userChoice}
            onChangeText={setUserChoice}
          />
          <Button title="Submit Choice" onPress={submitChoice} />
          {aiResponse ? <Text style={styles.aiResponseText}>{aiResponse}</Text> : null}
          <Button title="Close" onPress={() => setStoryModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },
  currency: {
    fontSize: 20,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginRight: 10,
  },
  taskItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  taskText: {
    fontSize: 16,
  },
  completedTask: {
    fontSize: 16,
    textDecorationLine: 'line-through',
    color: '#888',
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },
  situationText: {
    fontSize: 18,
    marginBottom: 20,
  },
  choiceInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 20,
  },
  aiResponseText: {
    fontSize: 16,
    marginTop: 20,
    color: '#555',
  },
});