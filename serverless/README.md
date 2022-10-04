# Serverless Scripts

## Getting Started

### Install dependencies

In the `serverless` folder of the repository:

```
pip install -r requirements
```

### Environment Variables

The necessary environment variables are shared across the whole repository.\
Please refer to the [README](../README.md) in the root folder for
more instructions.

### Usage

#### Ingest Formatted JSON Data to Database

In the current folder:

```
python ingest.py <path to JSON file> ../backend/.env
```
