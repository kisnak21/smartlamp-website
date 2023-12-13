from flask import Flask, jsonify
from flask_cors import CORS
from firebase import firebase
import datetime
import pytz
import pandas as pd
import numpy as np


data1 = pd.read_csv("your-dataset")
data2 = pd.read_csv("your-dataset")

firebaseApp = firebase.FirebaseApplication(
    "your_firebase_url", None
)


# Bagi dataset 80:20
train_data = data1.copy()
test_data = data2.copy()

# question node


class CreateQuestion:
    def __init__(self, column, value):
        self.column = column
        self.value = value

    def check(self, data):
        val = data[self.column]
        return val >= self.value

    def __repr__(self):
        return "Is %s >= %s?" % (self.column, str(self.value))


# Decision tree class


class DecisionTree:
    def __init__(self):
        self.tree = None

    def entropy(self, y):
        _, counts = np.unique(y, return_counts=True)
        probabilities = counts / len(y)
        entropy = -np.sum(probabilities * np.log2(probabilities + 1e-9))
        return entropy

    def information_gain(self, X, y, feature):
        entropy_before = self.entropy(y)
        unique_values = np.unique(X[feature])
        weighted_entropy = 0

        for value in unique_values:
            subset_indices = X[feature] == value
            subset_y = y[subset_indices]
            subset_weight = len(subset_indices) / len(y)
            subset_entropy = self.entropy(subset_y)
            weighted_entropy += subset_weight * subset_entropy

        information_gain = entropy_before - weighted_entropy
        return information_gain

    def gain_ratio(self, X, y, feature):
        information_gain = self.information_gain(X, y, feature)
        entropy_s = self.entropy(y)
        if entropy_s == 0:
            return 0
        gain_ratio = information_gain / entropy_s
        return gain_ratio

    def find_best_attribute(self, X, y):
        best_gain_ratio = -np.inf
        best_attribute = None

        for attribute in X.columns:
            gain_ratio = self.gain_ratio(X, y, attribute)
            if gain_ratio > best_gain_ratio:
                best_gain_ratio = gain_ratio
                best_attribute = attribute

        return best_attribute

    def build_decision_tree(self, X, y):
        if len(np.unique(y)) == 1:
            return {"label": y.iloc[0]}
        if X.empty or len(X.columns) == 0:
            majority_label = np.argmax(np.bincount(y))
            return {"label": majority_label}

        best_attribute = self.find_best_attribute(X, y)
        if best_attribute is None:
            majority_label = np.argmax(np.bincount(y))
            return {"label": majority_label}

        tree = {"attribute": best_attribute, "children": {}}
        unique_values = np.unique(X[best_attribute])

        for value in unique_values:
            subset_indices = X[best_attribute] == value
            subset_X = X.loc[subset_indices].drop(columns=[best_attribute])
            subset_y = y[subset_indices]
            tree["children"][value] = self.build_decision_tree(subset_X, subset_y)

        return tree

    def fit(self, X, y):
        self.tree = self.build_decision_tree(X, y)

    def predict_instance(self, instance, node):
        if "label" in node:
            return node["label"]
        attribute = node["attribute"]
        value = instance[attribute]

        if value in node["children"]:
            child = node["children"][value]
            return self.predict_instance(instance, child)
        else:
            return None

    def predict(self, X):
        predictions = []
        for _, instance in X.iterrows():
            predictions.append(self.predict_instance(instance, self.tree))
        return predictions

    #     return rules_data
    def print_rules(self, node=None, rules_data=None, current_rule=None):
        if node is None:
            node = self.tree

        if rules_data is None:
            rules_data = []

        if current_rule is None:
            current_rule = {}

        if "label" in node:
            current_rule["Label"] = node["label"]
            rules_data.append(current_rule.copy())
            return

        attribute = node["attribute"]

        for value, child_node in node["children"].items():
            new_rule_part = {attribute: value}
            new_rule = {**current_rule, **new_rule_part}
            self.print_rules(child_node, rules_data, new_rule)

        return rules_data

    def print_tree(self, node=None, indent=0, tree_data=None):
        if node is None:
            node = self.tree

        if tree_data is None:
            tree_data = []

        if "label" in node:
            tree_data.append(
                {"Node": "Label", "Value": node["label"], "Indent": indent}
            )
            return

        attribute = node["attribute"]
        tree_data.append({"Node": "Attribute", "Value": attribute, "Indent": indent})

        for value, child_node in node["children"].items():
            question = CreateQuestion(attribute, value)
            tree_data.append(
                {"Node": "Question", "Value": repr(question), "Indent": indent + 1}
            )
            self.print_tree(child_node, indent + 2, tree_data)

        return tree_data


# akurasi


def calculate_accuracy(predictions, labels):
    correct_count = sum(predictions == labels)
    total_count = len(predictions)
    accuracy = correct_count / total_count
    return accuracy


def confusion_matrix(y_true, y_pred, labels):
    num_labels = len(labels)
    cm = np.zeros((num_labels, num_labels), dtype=int)

    for i in range(num_labels):
        true_label = labels[i]
        for j in range(num_labels):
            pred_label = labels[j]
            cm[i, j] = np.sum((y_true == true_label) & (y_pred == pred_label))

    return cm


def recall(cm, label_idx):
    true_positives = cm[label_idx, label_idx]
    total_positives = np.sum(cm[label_idx, :])
    recall_value = true_positives / total_positives if total_positives != 0 else 0
    return recall_value


def precision(cm, label_idx):
    true_positives = cm[label_idx, label_idx]
    total_predicted_positives = np.sum(cm[:, label_idx])
    precision_value = (
        true_positives / total_predicted_positives
        if total_predicted_positives != 0
        else 0
    )
    return precision_value


timeloc = pytz.timezone("Asia/Jakarta")


def generate_new_data():
    current_time = datetime.datetime.now(tz=timeloc).time()
    new_data = pd.DataFrame({"Waktu": [current_time]})
    new_data["Waktu"] = new_data["Waktu"].apply(lambda x: x.hour * 60 + x.minute)
    return new_data


# Membangun pohon keputusan C5.0 untuk setiap ruangan
decision_tree_kamar = DecisionTree()
decision_tree_kamar.fit(train_data[["Waktu"]], train_data["kamar"])

decision_tree_kamar2 = DecisionTree()
decision_tree_kamar2.fit(train_data[["Waktu"]], train_data["kamar2"])

decision_tree_teras = DecisionTree()
decision_tree_teras.fit(train_data[["Waktu"]], train_data["teras"])

decision_tree_dapur = DecisionTree()
decision_tree_dapur.fit(train_data[["Waktu"]], train_data["dapur"])

decision_tree_toilet = DecisionTree()
decision_tree_toilet.fit(train_data[["Waktu"]], train_data["toilet"])

decision_tree_ruangtamu = DecisionTree()
decision_tree_ruangtamu.fit(train_data[["Waktu"]], train_data["ruangtamu"])

# Mengabaikan data yang tidak diketahui pada setiap kolom target
test_data_kamar = test_data[test_data["kamar"] != "unknown"]
test_data_kamar2 = test_data[test_data["kamar2"] != "unknown"]
test_data_teras = test_data[test_data["teras"] != "unknown"]
test_data_dapur = test_data[test_data["dapur"] != "unknown"]
test_data_toilet = test_data[test_data["toilet"] != "unknown"]
test_data_ruangtamu = test_data[test_data["ruangtamu"] != "unknown"]

# Melakukan prediksi pada data uji yang telah difilter
predictions_kamar = decision_tree_kamar.predict(test_data_kamar[["Waktu"]])
predictions_kamar2 = decision_tree_kamar2.predict(test_data_kamar2[["Waktu"]])
predictions_teras = decision_tree_teras.predict(test_data_teras[["Waktu"]])
predictions_dapur = decision_tree_dapur.predict(test_data_dapur[["Waktu"]])
predictions_toilet = decision_tree_toilet.predict(test_data_toilet[["Waktu"]])
predictions_ruangtamu = decision_tree_ruangtamu.predict(test_data_ruangtamu[["Waktu"]])

# Menghitung akurasi pada data uji
accuracy_kamar = calculate_accuracy(predictions_kamar, test_data["kamar"])
accuracy_kamar2 = calculate_accuracy(predictions_kamar2, test_data["kamar2"])
accuracy_teras = calculate_accuracy(predictions_teras, test_data["teras"])
accuracy_dapur = calculate_accuracy(predictions_dapur, test_data["dapur"])
accuracy_toilet = calculate_accuracy(predictions_toilet, test_data["toilet"])
accuracy_ruangtamu = calculate_accuracy(predictions_ruangtamu, test_data["ruangtamu"])

# akurasi dataframe
accuracies = {
    "Ruangan": ["Kamar", "Kamar2", "Teras", "Dapur", "Toilet", "RuangTamu"],
    "Accuracy": [
        accuracy_kamar,
        accuracy_kamar2,
        accuracy_teras,
        accuracy_dapur,
        accuracy_toilet,
        accuracy_ruangtamu,
    ],
}

accuracy_df = pd.DataFrame(accuracies)
print(accuracy_df)
print()

# recall, precision dan cm
for column in ["kamar", "kamar2", "teras", "dapur", "toilet", "ruangtamu"]:
    decision_tree = DecisionTree()
    decision_tree.fit(train_data[["Waktu"]], train_data[column])
    y_test = test_data[column]
    y_pred = test_data.apply(
        lambda x: decision_tree.predict_instance(x, decision_tree.tree), axis=1
    )
    labels = np.unique(y_test)
    cm = confusion_matrix(y_test, y_pred, labels)

    print("Confusion Matrix ({}) :".format(column))
    print(cm)
    print()

    recall_values = []
    precision_values = []
    for i, label in enumerate(labels):
        r = recall(cm, i)
        p = precision(cm, i)
        recall_values.append(r)
        precision_values.append(p)

        print("Label: {} ({})".format(label, column))
        print("Recall: {:.0%} ".format(r))
        print("Precision: {:.0%} ".format(p))
        print()

        accuracy = calculate_accuracy(y_pred, y_test)
        precision_value_avg = np.mean(precision_values)
        recall_value_avg = np.mean(recall_values)

    data = {
        "confussion_matrix": cm.tolist(),
        "accuracy": "{:.0%}".format(accuracy),
        "recall": "{:.0%}".format(recall_value_avg),
        "precision": "{:.0%}".format(precision_value_avg),
    }
    # Menyimpan data ke Firebase
    # Sesuaikan dengan struktur Firebase Anda
    path = f"/confusion_matrix/{column}"
    response = firebaseApp.put(path, "/", data)

    print(f"Informasi ({column}) berhasil disimpan di Firebase dengan path: {path}")
    print(response)
    print()


def convert_to_python_int(data):
    if isinstance(data, np.int64) or isinstance(data, np.int32):
        return int(data)
    elif isinstance(data, dict):
        return {key: convert_to_python_int(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [convert_to_python_int(item) for item in data]
    else:
        return data


# Mencetak rules untuk setiap ruangan dan menggabungkannya menjadi satu data
rules_data = {
    "kamar": convert_to_python_int(decision_tree_kamar.print_rules()),
    "kamar2": convert_to_python_int(decision_tree_kamar2.print_rules()),
    "teras": convert_to_python_int(decision_tree_teras.print_rules()),
    "dapur": convert_to_python_int(decision_tree_dapur.print_rules()),
    "toilet": convert_to_python_int(decision_tree_toilet.print_rules()),
    "ruangtamu": convert_to_python_int(decision_tree_ruangtamu.print_rules()),
}

# Kirim data aturan ke Firebase Realtime Database
firebaseApp.put("/rules", "/", rules_data)

print(type(train_data))
print(type(test_data))


tree_kamar = decision_tree_kamar.print_tree()
print("Pohon Keputusan Kamar:")
print(tree_kamar)
print()

tree_kamar2 = decision_tree_kamar2.print_tree()
print("Pohon Keputusan Kamar2:")
print(tree_kamar2)
print()

tree_teras = decision_tree_teras.print_tree()
print("Pohon Keputusan Teras:")
print(tree_teras)
print()

tree_dapur = decision_tree_dapur.print_tree()
print("Pohon Keputusan Dapur:")
print(tree_dapur)
print()

tree_toilet = decision_tree_toilet.print_tree()
print("Pohon Keputusan Toilet:")
print(tree_toilet)
print()

tree_ = decision_tree_ruangtamu.print_tree()
print("Pohon Keputusan RuangTamu:")
print(tree_)
print()


app = Flask(__name__)
CORS(app)
app.config["CORS_HEADER"] = "Content-Type"

decision_tree_kamar = DecisionTree()
decision_tree_kamar.fit(train_data[["Waktu"]], train_data["kamar"])

decision_tree_kamar2 = DecisionTree()
decision_tree_kamar2.fit(train_data[["Waktu"]], train_data["kamar2"])

decision_tree_teras = DecisionTree()
decision_tree_teras.fit(train_data[["Waktu"]], train_data["teras"])

decision_tree_dapur = DecisionTree()
decision_tree_dapur.fit(train_data[["Waktu"]], train_data["dapur"])

decision_tree_toilet = DecisionTree()
decision_tree_toilet.fit(train_data[["Waktu"]], train_data["toilet"])

decision_tree_ruangtamu = DecisionTree()
decision_tree_ruangtamu.fit(train_data[["Waktu"]], train_data["ruangtamu"])


@app.route("/api/evaluasi")
def evaluasi():
    TP = 'your-data'
    TN = 'your-data'
    FP = 'your-data'
    FN = 'your-data'

    accuracy = (TP + TN) / (TP + TN + FP + FN)
    precision = TP / (FP + TP)
    recall = TP / (TP + FN)
    missclasify = (FP + FN) / (TP + TN + FP + FN)
    return jsonify(
        {
            "accuracy": "{:.2f}%".format(accuracy * 100),
            "precision": "{:.2f}%".format(precision * 100),
            "recall": "{:.2f}%".format(recall * 100),
            "missclasify": "{:.2f}%".format(missclasify * 100),
        }
    )


@app.route("/api/rules")
def get_rules_all_rooms():
    rules = {
        "kamar": convert_to_python_int(decision_tree_kamar.print_rules()),
        "kamar2": convert_to_python_int(decision_tree_kamar2.print_rules()),
        "teras": convert_to_python_int(decision_tree_teras.print_rules()),
        "dapur": convert_to_python_int(decision_tree_dapur.print_rules()),
        "toilet": convert_to_python_int(decision_tree_toilet.print_rules()),
        "ruangtamu": convert_to_python_int(decision_tree_ruangtamu.print_rules()),
    }
    return jsonify(rules)


# Endpoint to display accuracy, precision, recall, and decision tree rules for each room
@app.route("/api/result")
def show_result():
    result = {}
    for column in ["kamar", "kamar2", "teras", "dapur", "toilet", "ruangtamu"]:
        decision_tree = DecisionTree()
        decision_tree.fit(train_data[["Waktu"]], train_data[column])
        y_test = test_data[column]
        y_pred = test_data.apply(
            lambda x: decision_tree.predict_instance(x, decision_tree.tree), axis=1
        )
        labels = np.unique(y_test)
        cm = confusion_matrix(y_test, y_pred, labels)

        print("Confusion Matrix ({}) :".format(column))
        print(cm)
        print()

        recall_values = []
        precision_values = []
        for i, label in enumerate(labels):
            r = recall(cm, i)
            p = precision(cm, i)
            recall_values.append(r)
            precision_values.append(p)

            print("Label: {} ({})".format(label, column))
            print("Recall: {:.0%}%".format(r))
            print("Precision: {:.0%}%".format(p))
            print()

        accuracy = calculate_accuracy(y_pred, y_test)
        precision_value_avg = np.mean(precision_values)
        recall_value_avg = np.mean(recall_values)

        result[column] = {
            "accuracy": "{:.0%}".format(accuracy),
            "precision on": "{:.0%} %".format(precision_values[0]),
            "precision off": "{:.0%} %".format(precision_values[1]),
            "recall on": "{:.0%}".format(recall_values[0]),
            "recall off": "{:.0%}".format(recall_values[1]),
            "precision_avg": "{:.0%}".format(precision_value_avg),
            "recall_avg": "{:.0%}".format(recall_value_avg),
        }

    return jsonify(result=result)


@app.route("/api/status")
def classify_new_data():
    new_data = generate_new_data()
    result = {}

    # Buat dictionary decision_tree
    decision_trees = {
        "kamar": decision_tree_kamar,
        "kamar2": decision_tree_kamar2,
        "teras": decision_tree_teras,
        "dapur": decision_tree_dapur,
        "toilet": decision_tree_toilet,
        "ruangtamu": decision_tree_ruangtamu,
    }

    # Ambil waktu satu kali
    current_time = datetime.datetime.now(tz=timeloc)

    # Inisialisasi respons dengan Tanggal dan Waktu
    response = {
        "Tanggal": current_time.strftime("%d-%m-%Y"),
        "Waktu": current_time.strftime("%H:%M:%S"),
    }

    # Loop melalui semua kolom dan prediksi
    for column, decision_tree in decision_trees.items():
        if decision_tree:
            predictions = decision_tree.predict(new_data[["Waktu"]])
            response[column] = "hidup" if predictions[0] == 2 else "mati"

    return jsonify(response)


@app.route("/api/train", methods=["POST"])
def train_models():
    try:
        firebaseApp = firebase.FirebaseApplication(
            "your_firebase_url", None
        )

        train_data = data1.copy()
        test_data = data2.copy()

        train_data_dict = train_data.to_dict(
            orient="index"
        )  # Convert DataFrame to dict
        test_data_dict = test_data.to_dict(orient="index")

        firebaseApp.put("/", "data_latih", train_data_dict)
        firebaseApp.put("/", "data_uji", test_data_dict)

        decision_tree_kamar = DecisionTree()
        decision_tree_kamar.fit(train_data[["Waktu"]], train_data["kamar"])

        decision_tree_kamar2 = DecisionTree()
        decision_tree_kamar2.fit(train_data[["Waktu"]], train_data["kamar2"])

        decision_tree_teras = DecisionTree()
        decision_tree_teras.fit(train_data[["Waktu"]], train_data["teras"])

        decision_tree_dapur = DecisionTree()
        decision_tree_dapur.fit(train_data[["Waktu"]], train_data["dapur"])

        decision_tree_toilet = DecisionTree()
        decision_tree_toilet.fit(train_data[["Waktu"]], train_data["toilet"])

        decision_tree_ruangtamu = DecisionTree()
        decision_tree_ruangtamu.fit(train_data[["Waktu"]], train_data["ruangtamu"])

        return jsonify({"success": True, "message": "Models trained successfully"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})


def calculate_entropy(room_data):
    unique_labels, label_counts = np.unique(room_data, return_counts=True)
    probabilities = label_counts / len(room_data)
    entropy = -np.sum(probabilities * np.log2(probabilities + 1e-9))
    return entropy


def calculate_information_gain(room_data, target_data):
    entropy_before = calculate_entropy(target_data)
    unique_values = np.unique(room_data)
    weighted_entropy = 0

    for value in unique_values:
        subset_indices = room_data == value
        subset_target = target_data[subset_indices]
        subset_weight = len(subset_indices) / len(target_data)
        subset_entropy = calculate_entropy(subset_target)
        weighted_entropy += subset_weight * subset_entropy

    information_gain = entropy_before - weighted_entropy
    return information_gain


def calculate_gain_ratio(room_data, target_data):
    information_gain = calculate_information_gain(room_data, target_data)
    entropy_s = calculate_entropy(room_data)
    if entropy_s == 0:
        return 0
    gain_ratio = information_gain / entropy_s
    return gain_ratio


@app.route("/api/gain-ratio/<room_name>")
def get_gain_ratio(room_name):
    try:
        # Assuming you have a dictionary mapping room names to their data columns
        room_columns = {
            "kamar": train_data["kamar"],
            "kamar2": train_data["kamar2"],
            "teras": train_data["teras"],
            "dapur": train_data["dapur"],
            "toilet": train_data["toilet"],
            "ruangtamu": train_data["ruangtamu"],
        }

        if room_name in room_columns:
            # Use the correct target column name from your dataset
            gain_ratio = calculate_gain_ratio(
                room_columns[room_name], train_data[room_name]
            )
            return jsonify({"gain_ratio": gain_ratio})
        else:
            return jsonify({"error": "Room not found"})

    except Exception as e:
        return jsonify({"error": str(e)})


@app.route("/api/gain-ratio/all")
def get_gain_ratio_for_all_rooms():
    gain_ratios = {}
    for room_name, room_data in room_columns.items():
        # Use the correct target column name from your dataset
        gain_ratio = calculate_gain_ratio(room_data, train_data[room_name])
        gain_ratios[room_name] = gain_ratio

    return jsonify(gain_ratios)


@app.route("/api/information-gain/<room_name>")
def get_information_gain(room_name):
    try:
        # Assuming you have a dictionary mapping room names to their data columns
        room_columns = {
            "kamar": train_data["kamar"],
            "kamar2": train_data["kamar2"],
            "teras": train_data["teras"],
            "dapur": train_data["dapur"],
            "toilet": train_data["toilet"],
            "ruangtamu": train_data["ruangtamu"],
        }

        if room_name in room_columns:
            # Use the correct target column name from your dataset
            information_gain = calculate_information_gain(
                room_columns[room_name], train_data[room_name]
            )
            return jsonify({"information_gain": information_gain})
        else:
            return jsonify({"error": "Room not found"})

    except Exception as e:
        return jsonify({"error": str(e)})


@app.route("/api/information-gain/all")
def get_information_gain_for_all_rooms():
    information_gains = {}
    for room_name, room_data in room_columns.items():
        information_gain = calculate_information_gain(room_data, train_data[room_name])
        information_gains[room_name] = information_gain

    return jsonify(information_gains)


@app.route("/api/entropy/<room_name>")
def get_entropy(room_name):
    try:
        # Assuming you have a dictionary mapping room names to their data columns
        room_columns = {
            "kamar": train_data["kamar"],
            "kamar2": train_data["kamar2"],
            "teras": train_data["teras"],
            "dapur": train_data["dapur"],
            "toilet": train_data["toilet"],
            "ruangtamu": train_data["ruangtamu"],
        }

        if room_name in room_columns:
            entropy = calculate_entropy(room_columns[room_name])
            return jsonify({"entropy": entropy})
        else:
            return jsonify({"error": "Room not found"})

    except Exception as e:
        return jsonify({"error": str(e)})


@app.route("/api/entropy/all")
def get_entropy_for_all_rooms():
    entropies = {}
    for room_name, room_data in room_columns.items():
        entropy = calculate_entropy(room_data)
        entropies[room_name] = entropy

    return jsonify(entropies)


room_columns = {
    "kamar": train_data["kamar"],
    "kamar2": train_data["kamar2"],
    "teras": train_data["teras"],
    "dapur": train_data["dapur"],
    "toilet": train_data["toilet"],
    "ruangtamu": train_data["ruangtamu"],
}


@app.route("/")
def index():
    return jsonify("selamat datang di api untuk menggunakan algoritma C5.0")


if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
