var selectOptionNumber = 0;
var countryData = undefined;
var countdownEndtime = 0;
var eventIndex = 0;
var offset = 0;

$(document).ready(function() {
    setSelectOptionNumber();
    setCountrySelection();
    initializeClock();

    $(window).on('resize', function(){
        setSelectOptionNumber();
        adjustStreamingsHeight();
    });

    $('#country_selection').on('change', function() {
        countryData = findCountdown($(this).val());
        currentTimestamp = getTimestamp();
        countdownEndtime = 0;
        for (var i = 0; i < countryData.events.length; i++) {
            if (countryData.events[i].time > currentTimestamp) {
                countdownEndtime = countryData.events[i].time;
                eventIndex = i;
                break;
            }
        }

        if (countdownEndtime > getTimestamp()) {
            console.log('initializeClock();')
            initializeClock();
        }
    });

    $('#video_multiselect').multiselect({
        nonSelectedText: '請選擇至少一個頻道',
        onChange: function(item, insert) {
            id = item[0].value
            if (insert) {
                const streaming = findStreaming(id);
                appendStreaming(streaming);
            } else {
                removeStreaming(id);
            }
            disableOptions();
        },
        buttonText: function(options, select) {
            if (options.length === 0) {
                return '請選擇至少一個頻道';
            } else if (options.length > 3) {
                return '已選擇 ' + options.length + ' 個頻道';
            } else {
                var labels = [];
                options.each(function() {
                    if ($(this).attr('label') !== undefined) {
                        labels.push($(this).attr('label'));
                    } else {
                        labels.push($(this).html());
                    }
                });
                label_str = labels.join(', ') + '';
                if (label_str.length > 15) {
                    return label_str.slice(0, 15) + ' ......'
                }
                return label_str
             }
        }
    });

    $('#video_multiselect').multiselect('dataprovider', getStreamingOptions(streamings));
    selected_options = $('#video_multiselect option:selected').map(function(a, item){return item.value;});
    for (var i = 0; i < selected_options.length && i < selectOptionNumber; i++) {
        const streaming = findStreaming(selected_options[i]);
        appendStreaming(streaming);
    }

    disableOptions();
    adjustStreamingsHeight();
});

function setSelectOptionNumber() {
    if ($(window).width() >= 768) {
        selectOptionNumber = 9
    } else {
        // switch mobile screen
        if (selectOptionNumber == 9) {
            mobileStreamings()
        }
        selectOptionNumber = 2
    }
    disableOptions();
}

function getStreamingOptions(streamings) {
    count = 0
    streamingOptions = streamings.map(function(item){
        if (item.selected) {
            count += 1;
        }
        return {
            label: item.location_name,
            title: item.location_name,
            value: item.id,
            selected: count <= selectOptionNumber ? item.selected : false,
        }
    })

    return streamingOptions;
}

function appendStreaming(streaming) {
    $('#streaming_list').append('<div class="col-lg-4 col-md-6 streaming-video mb-4" id="streaming_video_'+streaming.id+'"><iframe id="player" width=100% height=100% src="https://www.youtube.com/embed/'+streaming.youtube_id+'?autoplay=1&mute=1&info=0&controls=0" frameborder="0"></iframe></div>');
    adjustStreamingsHeight();
}

function removeStreaming(id) {
    $('#streaming_video_'+id).remove()
}

function findStreaming(id) {
    return streamings.find(item => item.id == id);
}

function mobileStreamings() {
    ids = []
    $('.streaming-video').each(function(index, value) {
        if (index > 1) {
            $(this).remove();
            ids.push($(this)[0].id.split('_')[2]);
        }
    });
    $('#video_multiselect').multiselect('deselect', ids);
}

function disableOptions() {
    // Get selected options.
    var selectedOptions = $('#video_multiselect option:selected');
 
    if (selectedOptions.length >= selectOptionNumber) {
        // Disable all other checkboxes.
        var nonSelectedOptions = $('#video_multiselect option').filter(function() {
            return !$(this).is(':selected');
        });

        nonSelectedOptions.each(function() {
            var input = $('input[value="' + $(this).val() + '"]');
            input.prop('disabled', true);
            input.closest('li').addClass('disabled');
        });
    }
    else {
        // Enable all checkboxes.
        $('#video_multiselect option').each(function() {
            var input = $('input[value="' + $(this).val() + '"]');
            input.prop('disabled', false);
            input.closest('li').removeClass('disabled');
        });
    }
}

function adjustStreamingsHeight() {
    $('.streaming-video').each(function() {
        $(this).height($(this).width() / 16 * 9);
    });
}

function setCountrySelection() {
    selections = getCountdownOptions();
    for (var i = 0; i < selections.length; i++) {
        $('#country_selection').append('<option value="' + selections[i].value + '"' + (selections[i].default ? ' selected' : '') + '>' + selections[i].name + '</option>')
    }
}

function getCountdownOptions() {
    return countdowns.map(function(item){
        return {
            name: item.display_name,
            value: item.name,
            default: item.default,
        }
    })
}

function findCountdown(val) {
    return countdowns.find(item => item.name == val);
}

function getTimestamp() {
    return parseInt(Date.now() / 1000) + offset
}

function getTimeRemaining(endtime) {
    tmp_total = endtime - getTimestamp();
    const total = tmp_total <= 0 ? 0 : parseInt(tmp_total)
    const seconds = Math.floor(total % 60);
    const minutes = Math.floor((total / 60) % 60);
    const hours = Math.floor((total / (60 * 60)) % 24);
    const days = Math.floor(total / (60 * 60 * 24));
    
    return {
        total,
        days,
        hours,
        minutes,
        seconds
    };
}
  
function initializeClock() {
    countryData = findCountdown($('#country_selection').val());
    currentTimestamp = getTimestamp();
    countdownEndtime = 0;
    for (var i = 0; i < countryData.events.length; i++) {
        if (countryData.events[i].time > currentTimestamp) {
            countdownEndtime = countryData.events[i].time;
            eventIndex = i;
            $('#event_name').text(countryData.events[i].display_name);
            $('#event_time').text('(' + toTimeFormat(countdownEndtime) + ')')
            break;
        }
    }
    const daysSpan = $('#event_days');
    const hoursSpan = $('#event_hours');
    const minutesSpan = $('#event_minutes');
    const secondsSpan = $('#event_seconds');
  
    function updateClock() {
        const t = getTimeRemaining(countdownEndtime);
  
        $('#event_name').text(countryData.events[eventIndex].display_name);
        $('#event_time').text('(' + toTimeFormat(countdownEndtime) + ')')
        daysSpan.text(t.days < 10 ? ('0' + t.days).slice(-2) : t.days);
        hoursSpan.text(('0' + t.hours).slice(-2));
        minutesSpan.text(('0' + t.minutes).slice(-2));
        secondsSpan.text(('0' + t.seconds).slice(-2));

        if ((t.days + t.hours + t.minutes + t.seconds) === 0 ) {
            $('#event_days_div').removeClass('hide');
        } else if (t.days === 0) {
            $('#event_days_div').addClass('hide');
        }
  
        if (t.total <= 0) {
            if (eventIndex < countryData.events.length - 1) {
                eventIndex += 1
                countdownEndtime = countryData.events[eventIndex].time;
            } else {
                clearInterval(timeinterval);
            }
        }
    }
  
    updateClock();
    const timeinterval = setInterval(updateClock, 1000);
}

function toTimeFormat(unixTime) {
    date = new Date(unixTime * 1000);
    year = date.getYear() + 1900;
    month = '0' + (date.getMonth() + 1);
    day = '0' + date.getDate();
    hour = '0' + date.getHours();
    minute = '0' + date.getMinutes();
    second = '0' + date.getSeconds();

    return year + '-' + month.substr(-2) + '-' + day.substr(-2) + ' ' + hour.substr(-2) + ':' + minute.substr(-2) + ':' + second.substr(-2);
}
