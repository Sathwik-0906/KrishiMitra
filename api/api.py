from flask import Flask, request, jsonify
import pandas as pd

app = Flask(__name__)

df = pd.read_excel("Model_Data.xlsx") 

df.columns = [c.strip().lower() for c in df.columns]

@app.route("/get-data", methods=["GET"])
def get_data():
    column = request.args.get("column", "").strip().lower()
    value = request.args.get("value", "")

    if column and value:
        if column not in df.columns:
            return jsonify({"error": f"Column '{column}' not found. Available: {df.columns.tolist()}"}), 400
        result = df[df[column] == value]
    else:
        result = df

    return jsonify(result.to_dict(orient="records"))


if __name__ == '__main__':
    app.run(debug=True)
