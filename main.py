from datetime import date

import requests
from dotenv import dotenv_values
from supabase import Client, create_client

config = dotenv_values(".env")

# get the date of the script run
today = date.today()
today = today.strftime("%Y-%m-%d")


url: str = config["SUPABASE_URL"]
key: str = config["SUPABASE_KEY"]

supabase: Client = create_client(url, key)


def get_strava_token() -> str:
    """generates Strava Auth token and returns it"""
    auth_url = "https://www.strava.com/oauth/token"

    payload = {
        "client_id": config["STRAVA_CLIENT_ID"],
        "client_secret": config["STRAVA_CLIENT_SECRET"],
        "refresh_token": config["STRAVA_REFRESH_TOKEN"],
        "grant_type": "refresh_token",
        "f": "json",
    }

    res = requests.post(auth_url, data=payload, verify=False)
    return res.json()["access_token"]


def get_club_activities():
    url = "https://www.strava.com/api/v3/clubs/teampulsepoint/activities"

    headers = {"Authorization": f"Bearer {get_strava_token()}"}
    param = {"per_page": 6, "page": 1}
    return requests.get(url, headers=headers, params=param).json()


def main():
    """
    1. get the activities from Strava
    2. check if the activity already exists in the database and if not insert it
    """

    incoming_activities = []  # incoming activities from Strava
    table_activites = []  # activities from the database
    activities_to_insert = []  # activities to insert into the database

    # 1. Get the activities from Strava and place inside incoming_activities
    try:
        if get_club_activities():
            # Loop through response and get the data we need to insert into the database
            for activity in get_club_activities():
                athlete_activity = {
                    "firstName": activity["athlete"]["firstname"],
                    "lastName": activity["athlete"]["lastname"],
                    "activityName": activity["name"],
                    "distance": round(activity["distance"]),
                    "movingTime": round(activity["moving_time"]),
                    "sportType": activity["sport_type"],
                }

                incoming_activities.append(athlete_activity)

    except Exception as error:
        raise error

    print(f"incoming_activities: {incoming_activities} \n")

    # 2. Get activities from the database and place inside table_activites
    try:
        db_activities = supabase.table("PPStravaActivities").select("*").execute()

        # clean up db_activities by removing id
        for db_activity in db_activities.data:
            result = {
                "firstName": db_activity["firstName"],
                "lastName": db_activity["lastName"],
                "activityName": db_activity["activityName"],
                "distance": round(db_activity["distance"]),
                "movingTime": round(db_activity["movingTime"]),
                "sportType": db_activity["sportType"],
            }

            table_activites.append(result)
    except Exception as error:
        raise error

    print(f"table_activites: {table_activites} \n")

    # 3. Compare incoming_activities to table_activites and place the activities that
    # are not in the database inside activities_to_insert
    try:
        activities_to_insert.extend(
            act for act in incoming_activities if act not in table_activites
        )
        print(f"activities_to_insert: {activities_to_insert} \n")
    except Exception as error:
        raise error

    # 3. Insert the activities into the database
    try:
        for activity in activities_to_insert:
            supabase.table("PPStravaActivities").insert(activity).execute()
    except Exception as error:
        raise error


if __name__ == "__main__":
    main()
