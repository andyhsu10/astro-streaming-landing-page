var selectOptionNumber = 0;
$(document).ready(function() {
    setSelectOptionNumber();
    $(window).on('resize', function(){
        setSelectOptionNumber();
        adjustStreamingsHeight();
    });

    $('#video_multiselect').multiselect({
        nonSelectedText: '請選擇至少一個頻道',
        onChange: function(element, insert) {
            id = element[0].value
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
                return labels.join(', ') + '';
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
    $('#streaming_list').append('<div class="col-lg-4 col-md-6 streaming-video mb-4" id="streaming_video_'+streaming.id+'"><iframe id="player" width=100% height=100% src="https://www.youtube.com/embed/'+streaming.youtube_id+'?autoplay=0&mute=1&info=0&controls=0" frameborder="0"></iframe></div>');
    adjustStreamingsHeight();
}

function removeStreaming(id) {
    $('#streaming_video_'+id).remove()
}

function findStreaming(id) {
    return streamings.find(element => element.id == id);
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
