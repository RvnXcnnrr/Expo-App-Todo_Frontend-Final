import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  Animated,
  Easing,
  Alert
} from "react-native";

import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const AddTaskScreen = ({
  navigation,
  route,
  addTask,
  editTask,
  isDarkMode,
}) => {
  const [text, setText] = useState("");
  const [category, setCategory] = useState("Personal");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [buttonScale] = useState(new Animated.Value(1));
  const [isEditing, setIsEditing] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);

  useEffect(() => {
    if (route.params?.taskToEdit) {
      const { taskToEdit } = route.params;
      setText(taskToEdit.text);
      setCategory(taskToEdit.category);
      setPriority(taskToEdit.priority);
      setDueDate(taskToEdit.dueDate ? new Date(taskToEdit.dueDate) : null);
      setIsEditing(true);
      setCurrentTaskId(taskToEdit.id);
      navigation.setOptions({ title: "Edit Task" });
    } else {
      setIsEditing(false);
      setCurrentTaskId(null);
      setDueDate(null);
      navigation.setOptions({ title: "Add New Task" });
    }
  }, [route.params]);

  const handleSubmit = () => {
    if (text.trim()) {
      const confirmationTitle = isEditing ? "Save Changes" : "Add Task";
      const confirmationMessage = isEditing 
        ? "Are you sure you want to save these changes?" 
        : "Are you sure you want to add this task?";
      
      Alert.alert(
        confirmationTitle,
        confirmationMessage,
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          { 
            text: "Confirm", 
            onPress: () => {
              if (isEditing) {
                const updatedTask = {
                  id: currentTaskId,
                  text: text.trim(),
                  category,
                  priority,
                  dueDate: dueDate ? dueDate.toISOString() : null,
                };
                editTask(currentTaskId, updatedTask);
              } else {
                const newTask = {
                  id: Date.now().toString(),
                  text: text.trim(),
                  completed: false,
                  category,
                  priority,
                  createdAt: new Date().toISOString(),
                  dueDate: dueDate ? dueDate.toISOString() : null,
                };
                addTask(newTask);
              }
              navigation.goBack();
            }
          }
        ]
      );
    }
  };


  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start(handleSubmit);
  };

  const showAndroidDateTimePicker = () => {
    DateTimePickerAndroid.open({
      value: dueDate || new Date(),
      onChange: onChangeDate,
      mode: 'datetime',
      minimumDate: new Date(),
      is24Hour: true,
    });
  };

  const categories = ["Work", "Personal", "Shopping", "Health", "Other"];
  const priorities = ["Low", "Medium", "High"];

  const onChangeDate = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      if (event.type === 'set') {
        setDueDate(selectedDate);
      }
    } else {
      if (event?.type === "dismissed") {
        setTimeout(() => {
          setShowDatePicker(false);
        }, 100);
        return;
      }

      if (event?.type === "set") {
        if (selectedDate) {
          setDueDate(selectedDate);
        }
        setTimeout(() => {
          setShowDatePicker(false);
        }, 100);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#121212" : "#f5f5f5" },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inputContainer}>
          <Text
            style={[
              styles.label,
              isDarkMode ? styles.darkLabel : styles.lightLabel,
            ]}
          >
            Task Description
          </Text>
          <TextInput
            style={[
              styles.input,
              isDarkMode ? styles.darkInput : styles.lightInput,
            ]}
            placeholder="What needs to be done?"
            placeholderTextColor={isDarkMode ? "#aaa" : "#999"}
            value={text}
            onChangeText={setText}
            multiline
            autoFocus
          />
        </View>

        <View style={styles.section}>
          <Text
            style={[
              styles.label,
              isDarkMode ? styles.darkLabel : styles.lightLabel,
            ]}
          >
            Category
          </Text>
          <View style={styles.categoryContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  category === cat && styles.selectedCategory,
                  isDarkMode
                    ? styles.darkCategoryButton
                    : styles.lightCategoryButton,
                  {
                    borderColor: getCategoryColor(cat),
                    marginRight: 8,
                    marginBottom: 8,
                  },
                  category === cat && {
                    backgroundColor: getCategoryColor(cat),
                  },
                ]}
                onPress={() => setCategory(cat)}
                activeOpacity={0.7}
              >
                <Text style={styles.categoryText}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text
            style={[
              styles.label,
              isDarkMode ? styles.darkLabel : styles.lightLabel,
            ]}
          >
            Priority
          </Text>
          <View style={styles.priorityContainer}>
            {priorities.map((pri) => (
              <TouchableOpacity
                key={pri}
                style={[
                  styles.priorityButton,
                  priority === pri && styles.selectedPriority,
                  isDarkMode
                    ? styles.darkPriorityButton
                    : styles.lightPriorityButton,
                  {
                    borderColor: getPriorityColor(pri),
                    marginRight: 8,
                    marginBottom: 8,
                  },
                  priority === pri && {
                    backgroundColor: getPriorityColor(pri),
                  },
                ]}
                onPress={() => setPriority(pri)}
                activeOpacity={0.7}
              >
                <Text style={styles.priorityText}>{pri}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text
            style={[
              styles.label,
              isDarkMode ? styles.darkLabel : styles.lightLabel,
            ]}
          >
            Due Date
          </Text>
          <TouchableOpacity
            style={[
              styles.dateButton,
              isDarkMode ? styles.darkDateButton : styles.lightDateButton,
            ]}
            onPress={Platform.OS === 'android' ? showAndroidDateTimePicker : () => setShowDatePicker(true)}
          >
            <Text
              style={isDarkMode ? styles.darkDateText : styles.lightDateText}
            >
              {dueDate
                ? dueDate.toLocaleDateString() +
                  " " +
                  dueDate.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Select due date"}
            </Text>
            <Ionicons
              name="calendar-outline"
              size={20}
              color={isDarkMode ? "#fff" : "#000"}
            />
          </TouchableOpacity>
          
          {Platform.OS === "ios" && showDatePicker && (
            <DateTimePicker
              value={dueDate || new Date()}
              mode="datetime"
              display="default"
              onChange={onChangeDate}
              minimumDate={new Date()}
              style={{ backgroundColor: isDarkMode ? "#121212" : "#fff" }}
            />
          )}
        </View>
      </ScrollView>

      <LinearGradient
        colors={isDarkMode ? ["#1E1E1E", "#121212"] : ["#fff", "#f5f5f5"]}
        style={styles.footer}
      >
        <TouchableOpacity
          style={[
            styles.cancelButton,
            isDarkMode ? styles.darkCancelButton : styles.lightCancelButton,
          ]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text
            style={isDarkMode ? styles.darkCancelText : styles.lightCancelText}
          >
            Cancel
          </Text>
        </TouchableOpacity>
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={[
              styles.addButton,
              {
                backgroundColor: text.trim()
                  ? getCategoryColor(category)
                  : "#ccc",
                opacity: text.trim() ? 1 : 0.6,
              },
            ]}
            onPress={animateButton}
            disabled={!text.trim()}
            activeOpacity={0.7}
          >
            <Text style={styles.addButtonText}>
              {isEditing ? "Save Changes" : "Add Task"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const getCategoryColor = (category) => {
  const colors = {
    Work: "#FF5722",
    Personal: "#2196F3",
    Shopping: "#4CAF50",
    Health: "#E91E63",
    Other: "#9C27B0",
  };
  return colors[category] || "#607D8B";
};

const getPriorityColor = (priority) => {
  const colors = {
    Low: "#4CAF50",
    Medium: "#FFC107",
    High: "#F44336",
  };
  return colors[priority] || "#FFC107";
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100,
    flexGrow: 1,
  },
  inputContainer: { marginBottom: 25 },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  darkLabel: {
    color: "#fff",
  },
  lightLabel: {
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
  },
  darkInput: {
    color: "#fff",
    backgroundColor: "#333",
    borderColor: "#444",
  },
  lightInput: {
    color: "#333",
    backgroundColor: "#fff",
    borderColor: "#ddd",
  },
  section: { marginBottom: 20 },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  darkCategoryButton: {
    backgroundColor: "#333",
  },
  lightCategoryButton: {
    backgroundColor: "#eee",
  },
  categoryText: {
    fontWeight: "500",
    fontSize: 14,
    color: "#fff",
  },
  selectedCategory: { borderWidth: 0 },
  priorityContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  priorityButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  darkPriorityButton: {
    backgroundColor: "#333",
  },
  lightPriorityButton: {
    backgroundColor: "#eee",
  },
  priorityText: {
    fontWeight: "500",
    fontSize: 14,
    color: "#fff",
  },
  selectedPriority: { borderWidth: 0 },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  darkDateButton: {
    backgroundColor: "#333",
    borderColor: "#444",
  },
  lightDateButton: {
    backgroundColor: "#eee",
    borderColor: "#ddd",
  },
  darkDateText: {
    color: "#fff",
  },
  lightDateText: {
    color: "#333",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    position: "absolute",
    bottom: 0,
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  darkCancelButton: {
    backgroundColor: "#333",
  },
  lightCancelButton: {
    backgroundColor: "#eee",
  },
  darkCancelText: {
    color: "#fff",
  },
  lightCancelText: {
    color: "#333",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  addButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});

export default AddTaskScreen;